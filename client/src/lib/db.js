export const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('starnet_db', 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('projects')) {
                db.createObjectStore('projects', { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

export const saveProjectToDB = async (project) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['projects'], 'readwrite');
        const store = transaction.objectStore('projects');
        const request = store.put(project);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const getProjectsFromDB = async () => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['projects'], 'readonly');
        const store = transaction.objectStore('projects');
        const projects = [];

        const request = store.openCursor();

        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                try {
                    projects.push(cursor.value);
                } catch (e) {
                    console.error("IndexedDB Read Error: Skipping malformed or too-large project entry.", e);
                }
                cursor.continue();
            } else {
                resolve(projects);
            }
        };

        request.onerror = (event) => {
            console.error("IndexedDB Transaction Error:", event.target.error);
            reject(event.target.error);
        };
    });
};

export const deleteProjectFromDB = async (id) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['projects'], 'readwrite');
        const store = transaction.objectStore('projects');
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};
