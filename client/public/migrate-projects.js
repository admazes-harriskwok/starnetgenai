/**
 * One-Time Migration Utility
 * Run this in browser console to convert old Base64 projects to URL-based storage
 */

async function migrateProjectsToURLStorage() {
    console.log('🔄 Starting project migration...');

    const projects = JSON.parse(localStorage.getItem('starnet_projects') || '[]');

    if (projects.length === 0) {
        console.log('✅ No projects to migrate.');
        return;
    }

    console.log(`Found ${projects.length} projects. Checking for Base64 data...`);

    let migratedCount = 0;
    let strippedCount = 0;

    const cleanedProjects = projects.map(project => {
        let hasBase64 = false;

        // Check thumbnail
        if (project.thumbnail && project.thumbnail.startsWith('data:image')) {
            hasBase64 = true;
            project.thumbnail = null;
            strippedCount++;
        }

        // Check nodes
        if (project.nodes) {
            project.nodes = project.nodes.map(node => {
                if (node.data) {
                    if (node.data.image && node.data.image.startsWith('data:image')) {
                        hasBase64 = true;
                        node.data.image = null;
                        strippedCount++;
                    }
                    if (node.data.output && node.data.output.startsWith('data:image')) {
                        hasBase64 = true;
                        node.data.output = null;
                        strippedCount++;
                    }
                }
                return node;
            });
        }

        if (hasBase64) {
            migratedCount++;
        }

        return project;
    });

    // Save cleaned projects
    try {
        localStorage.setItem('starnet_projects', JSON.stringify(cleanedProjects));
        console.log(`✅ Migration complete!`);
        console.log(`   - Projects migrated: ${migratedCount}`);
        console.log(`   - Base64 images stripped: ${strippedCount}`);
        console.log(`   - Storage saved: ~${(strippedCount * 2).toFixed(1)}MB`);

        // Show new storage size
        const newSize = JSON.stringify(cleanedProjects).length;
        console.log(`   - New storage size: ${(newSize / 1024).toFixed(1)}KB`);

        return {
            success: true,
            projectsMigrated: migratedCount,
            imagesStripped: strippedCount
        };
    } catch (error) {
        console.error('❌ Migration failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Auto-run if this file is executed
if (typeof window !== 'undefined') {
    console.log('Migration utility loaded. Run: migrateProjectsToURLStorage()');
}
