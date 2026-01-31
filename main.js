import './style.css'

const html = document.documentElement;
const canvas = document.getElementById("hero-lightpass");
const context = canvas.getContext("2d");
const endContent = document.getElementById("end-content");
const loader = document.getElementById("loader");

const frameCount = 240;

// Helper to format frame numbers (001, 002, ... 240)
// In Vite/Public folder, we reference from root '/'
const currentFrame = index => (
    `/The transition/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`
);

const images = [];
const imageObjects = []; // Store actual Image objects

// Preload images
const preloadImages = () => {
    let loadedCount = 0;
    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        img.onload = () => {
            loadedCount++;
            if (loadedCount === frameCount) {
               // Hide loader when all images are loaded
               loader.style.opacity = '0';
               setTimeout(() => loader.style.display = 'none', 500);
               drawImage(0); // Draw first frame
            }
        };
        img.onerror = () => {
             console.error(`Failed to load image: ${img.src}`);
             loadedCount++; // Still count to avoid stalling
             if (loadedCount === frameCount) {
                 loader.style.opacity = '0';
                 setTimeout(() => loader.style.display = 'none', 500);
             }
        };
        images.push(img.src);
        imageObjects.push(img);
    }
};

// Initialize Canvas Size with High-DPI support
const updateCanvasSize = () => {
     const dpr = window.devicePixelRatio || 1;
     canvas.width = window.innerWidth * dpr;
     canvas.height = window.innerHeight * dpr;
     
     // Ensure CSS size remains correct
     canvas.style.width = `${window.innerWidth}px`;
     canvas.style.height = `${window.innerHeight}px`;
     
     // Reset scale to handle the increased resolution
     context.setTransform(1, 0, 0, 1, 0, 0); // Reset transformation matrix
     context.scale(dpr, dpr);

     // On resize, we might want to redraw the current frame (will correspond to scroll)
     requestAnimationFrame(() => updateImage(getFileIndexFromScroll()));
}

window.addEventListener('resize', updateCanvasSize);
updateCanvasSize(); // Initial call

// Draw Image ensuring "cover" fit
const drawImage = (index) => {
    const img = imageObjects[index];
    if (!img || !img.complete) return;

    // We use window.innerWidth/Height because we scaled the context
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;

    const canvasRatio = canvasWidth / canvasHeight;
    const imgRatio = img.width / img.height;
    
    let drawWidth, drawHeight, offsetX, offsetY;

    if (imgRatio > canvasRatio) {
        // Image is wider than canvas
        drawHeight = canvasHeight;
        drawWidth = img.width * (canvasHeight / img.height);
        offsetX = (canvasWidth - drawWidth) / 2;
        offsetY = 0;
    } else {
        // Image is taller than canvas
        drawWidth = canvasWidth;
        drawHeight = img.height * (canvasWidth / img.width);
        offsetX = 0;
        offsetY = (canvasHeight - drawHeight) / 2;
    }

    // Clear the logic rect
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Optional: Smoothing settings
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

    context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

const getFileIndexFromScroll = () => {
     const scrollTop = html.scrollTop;
    
    // We want the animation to happen primarily within the scrolly-container.
    // But we need to account that the scrolly-container starts AFTER the hero.
    const scrollyContainer = document.querySelector('.scrolly-container');
    const containerTop = scrollyContainer.offsetTop;
    
    const startScroll = containerTop;
    const endScroll = containerTop + scrollyContainer.offsetHeight - window.innerHeight;
    
    let scrollFraction = (scrollTop - startScroll) / (endScroll - startScroll);
    
    // Clamp 0 to 1
    if (scrollFraction < 0) scrollFraction = 0;
    if (scrollFraction > 1) scrollFraction = 1;

    const frameIndex = Math.min(
        frameCount - 1,
        Math.ceil(scrollFraction * frameCount)
    );
    return frameIndex;
}

const updateImage = (index) => {
    drawImage(index);
}

// Scroll Handler
window.addEventListener('scroll', () => {  
    const frameIndex = getFileIndexFromScroll();
    requestAnimationFrame(() => updateImage(frameIndex));

    // Logic for showing End Content
    const scrollyContainer = document.querySelector('.scrolly-container');
    const endScrollTrigger = scrollyContainer.offsetTop + scrollyContainer.offsetHeight - window.innerHeight - 100;
    
    if (window.scrollY > endScrollTrigger) {
        endContent.classList.add('visible');
    } else {
        endContent.classList.remove('visible');
    }
});

// Start
preloadImages();
