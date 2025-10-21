// Dynamically get all pages for flexibility
let pages = Array.from(document.querySelectorAll('.page'));
let current = 0; // Start strictly on first page (cover)
let isAnimating = false; // Lock to prevent rapid clicks during transitions
let direction = 1; // 1 for next, -1 for prev

function renderPages(animDir = 1) {
    if (isAnimating) return; // Skip if animating

    isAnimating = true;
    direction = animDir;

    // Add flipping class to current page for animation start
    if (current > 0 || direction === 1) {
        pages[current].classList.add(direction === 1 ? 'flipping-forward' : 'flipping-backward');
    }

    // Wait for flip to start, then update layers
    setTimeout(() => {
        pages.forEach((page, index) => {
            // Reset classes
            page.classList.remove('flipped', 'active', 'stacked', 'flipping-forward', 'flipping-backward');

            if (index < current) {
                // Past pages: Flipped to the back (left side)
                page.classList.add('flipped');
                page.style.zIndex = index + 1; // Low z-index (1,2,3...)
            } else if (index === current) {
                // Current page: Fully visible on top
                page.classList.add('active');
                page.style.zIndex = 100; // Highest
            } else {
                // Future pages: Stacked subtly behind current
                page.classList.add('stacked');
                // Decreasing z-index for depth (e.g., 50 for next, 40 for after...)
                page.style.zIndex = 50 - (index - current) * 10;
            }
        });

        // Update button states
        const prevBtn = document.getElementById('prev');
        const nextBtn = document.getElementById('next');
        prevBtn.disabled = current === 0;
        nextBtn.disabled = current === pages.length - 1;

        // Remove flipping classes after transition (sync with CSS duration 1.2s)
        setTimeout(() => {
            pages.forEach(page => {
                page.classList.remove('flipping-forward', 'flipping-backward');
            });
            isAnimating = false;
        }, 1200); // Match CSS transition duration
    }, 50); // Small delay for smooth start
}

// Event listeners for Next/Prev with direction
document.getElementById('next').addEventListener('click', () => {
    if (current < pages.length - 1 && !isAnimating) {
        current++;
        renderPages(1); // Forward direction
    }
});

document.getElementById('prev').addEventListener('click', () => {
    if (current > 0 && !isAnimating) {
        current--;
        renderPages(-1); // Backward direction
    }
});

// Page Indicator: Create and update dots (clickable for direct navigation)
function createPageIndicator() {
    const indicator = document.getElementById('pageIndicator');
    indicator.innerHTML = '';
    pages.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === current) dot.classList.add('active');
        dot.addEventListener('click', () => {
            if (!isAnimating) {
                const newCurrent = index;
                const dir = newCurrent > current ? 1 : -1;
                current = newCurrent;
                renderPages(dir);
                updateIndicator();
            }
        });
        indicator.appendChild(dot);
    });
}

function updateIndicator() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === current);
    });
}

// Keyboard support (enhanced)
document.addEventListener('keydown', (e) => {
    if (isAnimating) return;
    switch (e.key) {
        case 'ArrowRight':
        case ' ':
            e.preventDefault();
            document.getElementById('next').click();
            break;
        case 'ArrowLeft':
            document.getElementById('prev').click();
            break;
        case 'f':
        case 'F':
            e.preventDefault();
            toggleFullscreen();
            break;
        case 'Escape':
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                document.getElementById('prev').click(); // Optional: Esc for prev
            }
            break;
    }
});

// Fullscreen Toggle
function toggleFullscreen() {
    const bookWrap = document.querySelector('.book-wrap');
    if (!document.fullscreenElement) {
        bookWrap.requestFullscreen().catch(err => {
            console.log('Fullscreen not supported');
        });
        document.getElementById('fullscreen').textContent = '❌ Exit Fullscreen';
    } else {
        document.exitFullscreen();
        document.getElementById('fullscreen').textContent = '⛶ Fullscreen';
    }
}

document.getElementById('fullscreen').addEventListener('click', toggleFullscreen);

// Touch/swipe support (improved for prev/next)
let startX = 0;
let endX = 0;

document.getElementById('book').addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
});

document.getElementById('book').addEventListener('touchend', (e) => {
    if (!e.changedTouches || isAnimating) return;
    endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    const threshold = 50;
    if (Math.abs(diff) > threshold) {
        if (diff > 0) {
            document.getElementById('next').click(); // Swipe left -> next
        } else {
            document.getElementById('prev').click(); // Swipe right -> prev
        }
    }
});

// Initial setup
createPageIndicator();
updateIndicator();
renderPages(); // Initial render: Only first page visible