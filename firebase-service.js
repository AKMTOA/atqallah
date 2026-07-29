// firebase-service.js — خدمة موحدة لعمليات Firestore
import { db } from './firebase-config.js';
import {
    collection, doc, getDoc, getDocs, onSnapshot, updateDoc, addDoc, deleteDoc,
    query, where, orderBy, increment, arrayUnion, arrayRemove, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/* ═══════════════════════════════════════════════
   1. إدارة الـ Listeners (منع Memory Leaks)
   ═══════════════════════════════════════════════ */

const _listeners = new Map();

export function registerListener(key, unsubscribeFn) {
    if (_listeners.has(key)) {
        _listeners.get(key)();
    }
    _listeners.set(key, unsubscribeFn);
}

export function unregisterListener(key) {
    if (_listeners.has(key)) {
        _listeners.get(key)();
        _listeners.delete(key);
    }
}

export function unregisterAllListeners() {
    _listeners.forEach(fn => fn());
    _listeners.clear();
}

/* ═══════════════════════════════════════════════
   2. Debounce — للتفاعلات السريعة
   ═══════════════════════════════════════════════ */

export function debounce(func, wait) {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

/* ═══════════════════════════════════════════════
   3. توحيد معرف المستخدم
   ═══════════════════════════════════════════════ */

export function getUserId() {
    return localStorage.getItem('authenticatedUserEmail');
}

/* ═══════════════════════════════════════════════
   4. دوال Firestore للمستخدم والملف الشخصي
   ═══════════════════════════════════════════════ */

export async function getStudentProfile(email) {
    if (!email) return null;
    try {
        const userRef = doc(db, 'users', email.toLowerCase());
        const snap = await getDoc(userRef);
        if (snap.exists()) {
            return snap.data();
        }
        return null;
    } catch (e) {
        console.error('getStudentProfile error:', e);
        return null;
    }
}

export async function awardPoints(email, pointsAmount, reason = '') {
    if (!email) return;
    try {
        const userRef = doc(db, 'users', email.toLowerCase());
        await updateDoc(userRef, {
            points: increment(pointsAmount)
        });
    } catch (e) {
        console.error('awardPoints error:', e);
    }
}

export async function logStudentStudySession(email, courseTitle, durationMins, pointsEarned = 15) {
    if (!email) return;
    try {
        const userRef = doc(db, 'users', email.toLowerCase());
        await updateDoc(userRef, {
            totalStudyMinutes: increment(durationMins),
            points: increment(pointsEarned)
        });
    } catch (e) {
        console.error('logStudentStudySession error:', e);
    }
}

/* ═══════════════════════════════════════════════
   5. دوال مجتمع الطلاب والشات المباشر
   ═══════════════════════════════════════════════ */

export function listenToLiveGroupChat(callback, key = 'liveChat') {
    const chatRef = collection(db, 'community_chat');
    const q = query(chatRef, orderBy('timestamp', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
        const msgs = [];
        snapshot.forEach(d => msgs.push({ id: d.id, ...d.data() }));
        callback(msgs);
    }, (err) => {
        console.error('listenToLiveGroupChat error:', err);
        callback([]);
    });
    if (key) registerListener(key, unsub);
    return unsub;
}

export async function sendLiveChatMessage(email, username, avatarId, text) {
    if (!text || !email) return;
    try {
        const chatRef = collection(db, 'community_chat');
        await addDoc(chatRef, {
            senderEmail: email,
            senderUsername: username,
            senderAvatar: avatarId,
            text: text,
            timestamp: serverTimestamp()
        });
    } catch (e) {
        console.error('sendLiveChatMessage error:', e);
    }
}

export async function createNewPost(email, username, avatarId, content, tag) {
    if (!content || !email) return;
    try {
        const postsRef = collection(db, 'community_posts');
        await addDoc(postsRef, {
            authorEmail: email,
            username: username,
            avatarId: avatarId,
            content: content,
            tag: tag || 'عام',
            likes: [],
            comments: [],
            timestamp: serverTimestamp()
        });
        await awardPoints(email, 10, 'نشر منشور في المجتمع');
    } catch (e) {
        console.error('createNewPost error:', e);
        throw e;
    }
}

export async function fetchCommunityPosts() {
    try {
        const postsRef = collection(db, 'community_posts');
        const q = query(postsRef, orderBy('timestamp', 'desc'));
        const snap = await getDocs(q);
        const posts = [];
        snap.forEach(d => {
            const data = d.data();
            posts.push({
                id: d.id,
                ...data,
                timeAgo: data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleDateString('ar-EG') : 'مؤخراً'
            });
        });
        return posts;
    } catch (e) {
        console.error('fetchCommunityPosts error:', e);
        return [];
    }
}

export async function toggleLikeOnPost(postId, email) {
    if (!postId || !email) return;
    try {
        const postRef = doc(db, 'community_posts', postId);
        const snap = await getDoc(postRef);
        if (snap.exists()) {
            const data = snap.data();
            const likes = data.likes || [];
            if (likes.includes(email)) {
                await updateDoc(postRef, { likes: arrayRemove(email) });
            } else {
                await updateDoc(postRef, { likes: arrayUnion(email) });
                await awardPoints(email, 2, 'إعجاب بمنشور');
            }
        }
    } catch (e) {
        console.error('toggleLikeOnPost error:', e);
    }
}

export async function addCommentToPost(postId, email, username, text) {
    if (!postId || !email || !text) return;
    try {
        const postRef = doc(db, 'community_posts', postId);
        const commentObj = {
            email,
            username,
            text,
            timestamp: Date.now()
        };
        await updateDoc(postRef, {
            comments: arrayUnion(commentObj)
        });
        await awardPoints(email, 5, 'تعليق في المجتمع');
    } catch (e) {
        console.error('addCommentToPost error:', e);
    }
}

/* ═══════════════════════════════════════════════
   6. دوال Firestore العامة
   ═══════════════════════════════════════════════ */

export function watchDocument(collectionName, docId, callback, key) {
    const ref = doc(db, collectionName, docId);
    const unsub = onSnapshot(ref, (snap) => {
        callback(snap.exists() ? snap.data() : null, snap);
    }, (err) => {
        console.error(`Watch [${collectionName}/${docId}] error:`, err);
        callback(null, null);
    });
    if (key) registerListener(key, unsub);
    return unsub;
}

export function watchCollection(collectionName, callback, key, options = {}) {
    const { whereField, whereValue, orderByField, orderDir = 'desc' } = options;
    let q = collection(db, collectionName);
    if (whereField && whereValue !== undefined) {
        q = query(q, where(whereField, '==', whereValue));
    }
    if (orderByField) {
        q = query(q, orderBy(orderByField, orderDir));
    }
    const unsub = onSnapshot(q, (snapshot) => {
        const items = [];
        snapshot.forEach(docSnap => items.push({ id: docSnap.id, ...docSnap.data() }));
        callback(items);
    }, (err) => {
        console.error(`Watch [${collectionName}] error:`, err);
        callback([]);
    });
    if (key) registerListener(key, unsub);
    return unsub;
}

export async function toggleLike(collectionName, docId, userId, liked) {
    const ref = doc(db, collectionName, docId);
    const userRef = doc(db, 'users', userId);
    if (liked) {
        await updateDoc(ref, { likes: increment(-1), likedBy: arrayRemove(userId) });
        await updateDoc(userRef, { points: increment(-1) });
    } else {
        await updateDoc(ref, { likes: increment(1), likedBy: arrayUnion(userId) });
        await updateDoc(userRef, { points: increment(1) });
    }
}

export async function addComment(articleId, commentData) {
    const commentsRef = collection(db, 'articles', articleId, 'comments');
    return await addDoc(commentsRef, {
        ...commentData,
        timestamp: serverTimestamp()
    });
}

export function watchComments(articleId, callback, key) {
    const commentsRef = collection(db, 'articles', articleId, 'comments');
    const unsub = onSnapshot(commentsRef, (snapshot) => {
        const comments = [];
        snapshot.forEach(docSnap => comments.push(docSnap.data()));
        comments.sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0));
        callback(comments);
    });
    if (key) registerListener(key, unsub);
    return unsub;
}

/* ═══════════════════════════════════════════════
   7. ربط كائن window بالدوال لاستخدامها مباشرة
   ═══════════════════════════════════════════════ */

window.registerListener = registerListener;
window.unregisterListener = unregisterListener;
window.unregisterAllListeners = unregisterAllListeners;
window.debounce = debounce;
window.getUserId = getUserId;
window.getStudentProfile = getStudentProfile;
window.awardPoints = awardPoints;
window.logStudentStudySession = logStudentStudySession;
window.listenToLiveGroupChat = listenToLiveGroupChat;
window.sendLiveChatMessage = sendLiveChatMessage;
window.createNewPost = createNewPost;
window.fetchCommunityPosts = fetchCommunityPosts;
window.toggleLikeOnPost = toggleLikeOnPost;
window.addCommentToPost = addCommentToPost;
window.watchDocument = watchDocument;
window.watchCollection = watchCollection;
window.toggleLike = toggleLike;
window.addComment = addComment;
window.watchComments = watchComments;

window.addEventListener('beforeunload', unregisterAllListeners);
