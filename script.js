// Force scroll to top on refresh
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

const startDate = new Date("October 27, 2023");
const targetDate = new Date("April 27, 2026");
let travelActive = false;

// Custom Smooth Scroller (Cinematic Easing)
function smoothScrollTo(targetY, duration = 1500, callback = null) {
    const startY = window.scrollY;
    const diff = targetY - startY;
    const startTime = performance.now();

    function animateScroll(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        window.scrollTo(0, startY + diff * easedProgress);

        if (progress < 1) {
            requestAnimationFrame(animateScroll);
        } else if (callback) {
            callback();
        }
    }
    requestAnimationFrame(animateScroll);
}

function updateCounter() {
    const now = new Date();
    const diffInMs = now - startDate;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    const countElement = document.getElementById('days-count');
    if (!countElement) return;

    let current = 0;
    const target = diffInDays;
    const increment = Math.ceil(target / 100) || 1;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
            
            // 1500ms DELAY BEFORE LETTER REVEAL
            setTimeout(() => {
                const messageSection = document.querySelector('.message-section');
                const envelope = document.getElementById('envelope');
                if (messageSection && envelope) {
                    messageSection.classList.add('revealed');
                    // 1500ms DELAY BEFORE SCROLLING TO CENTER ENVELOPE
                    setTimeout(() => {
                        const targetY = messageSection.offsetTop + (messageSection.offsetHeight / 2) - (window.innerHeight / 2);
                        smoothScrollTo(targetY, 2000);
                    }, 1500);
                }
            }, 1500);
        }
        countElement.innerText = current;
    }, 20);
}

function startTimeTravel() {
    const body = document.body;
    const machine = document.querySelector('.calendar-machine');
    const monthEl = document.getElementById('cal-month');
    const yearEl = document.getElementById('cal-year');
    const statusEl = document.querySelector('.travel-status');
    const titleEl = document.getElementById('travel-title');
    const heroSection = document.querySelector('.hero');

    if (!machine) return;

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const totalMonths = (targetDate.getFullYear() - startDate.getFullYear()) * 12 + (targetDate.getMonth() - startDate.getMonth());
    
    machine.addEventListener('click', () => {
        if (body.classList.contains('restored-state') || travelActive) return;
        
        travelActive = true;
        body.style.pointerEvents = 'none';
        titleEl.innerText = "Traveling through our memories...";

        const duration = 4000;
        const startTime = performance.now();

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = progress < 0.5 
                ? 2 * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            const grayscaleVal = 100 - (easedProgress * 100);
            body.style.filter = `grayscale(${grayscaleVal}%)`;
            body.style.backgroundColor = `rgba(248, 247, 242, ${easedProgress})`;

            const currentMonthIdx = Math.floor(easedProgress * totalMonths);
            const displayDate = new Date(startDate);
            displayDate.setMonth(startDate.getMonth() + currentMonthIdx);
            
            monthEl.innerText = months[displayDate.getMonth()];
            yearEl.innerText = displayDate.getFullYear();
            statusEl.innerText = `${months[displayDate.getMonth()]} 27, ${displayDate.getFullYear()}`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                body.classList.add('restored-state');
                body.style.filter = '';
                body.style.backgroundColor = '';
                body.style.pointerEvents = 'auto';
                titleEl.innerText = "Welcome back to our present. ❤️";
                travelActive = false;
                
                // 1500ms DELAY before smooth glide to hero
                setTimeout(() => {
                    smoothScrollTo(heroSection.offsetTop, 2000, () => {
                        // 1500ms DELAY AFTER GLIDE BEFORE COUNTER STARTS
                        setTimeout(updateCounter, 1500);
                    });
                }, 1500);
            }
        }
        requestAnimationFrame(animate);
    });
}

class PuzzleGame {
    constructor() {
        this.board = document.getElementById('puzzle-board');
        this.shuffleBtn = document.getElementById('shuffle-btn');
        this.winMsg = document.getElementById('puzzle-win');
        this.size = 2;
        this.tiles = [];
        this.imgSrc = 'images/photo1.jpg';
        this.init();
        this.shuffleBtn.addEventListener('click', () => this.shuffle());
    }

    init() {
        this.tiles = Array.from({length: this.size * this.size}, (_, i) => i);
        this.render();
    }

    render() {
        this.board.innerHTML = '';
        this.tiles.forEach((tileIdx, currentPos) => {
            const tile = document.createElement('div');
            tile.className = 'puzzle-tile';
            if (tileIdx === (this.size * this.size - 1)) {
                tile.classList.add('empty');
            } else {
                tile.style.backgroundImage = `url(${this.imgSrc})`;
                const row = Math.floor(tileIdx / this.size);
                const col = tileIdx % this.size;
                tile.style.backgroundPosition = `-${col * 150}px -${row * 150}px`;
                tile.addEventListener('click', () => this.move(currentPos));
            }
            this.board.appendChild(tile);
        });
    }

    move(pos) {
        const emptyIdx = this.size * this.size - 1;
        const emptyPos = this.tiles.indexOf(emptyIdx);
        const row = Math.floor(pos / this.size);
        const col = pos % this.size;
        const emptyRow = Math.floor(emptyPos / this.size);
        const emptyCol = emptyPos % this.size;
        const isAdjacent = (Math.abs(row - emptyRow) + Math.abs(col - emptyCol)) === 1;
        if (isAdjacent) {
            [this.tiles[pos], this.tiles[emptyPos]] = [this.tiles[emptyPos], this.tiles[pos]];
            this.render();
            this.checkWin();
        }
    }

    shuffle() {
        this.winMsg.classList.add('hidden');
        const emptyIdx = this.size * this.size - 1;
        for (let i = 0; i < 50; i++) {
            const adj = this.getAdjacent(this.tiles.indexOf(emptyIdx));
            const randomAdj = adj[Math.floor(Math.random() * adj.length)];
            const pos1 = this.tiles.indexOf(emptyIdx);
            [this.tiles[pos1], this.tiles[randomAdj]] = [this.tiles[randomAdj], this.tiles[pos1]];
        }
        this.render();
    }

    getAdjacent(pos) {
        const row = Math.floor(pos / this.size);
        const col = pos % this.size;
        const adj = [];
        if (row > 0) adj.push(pos - this.size);
        if (row < this.size - 1) adj.push(pos + this.size);
        if (col > 0) adj.push(pos - 1);
        if (col < this.size - 1) adj.push(pos + 1);
        return adj;
    }

    checkWin() {
        if (this.tiles.every((tile, i) => tile === i)) {
            this.winMsg.classList.remove('hidden');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const countElement = document.getElementById('days-count');
    if (countElement) countElement.innerText = "0";
    startTimeTravel();
    new PuzzleGame();
    
    const envelope = document.getElementById('envelope');
    const messageSection = document.querySelector('.message-section');

    if (envelope) {
        envelope.addEventListener('click', () => {
            if (envelope.classList.contains('open')) return;
            
            envelope.classList.add('open');
            // Wait for the letter to expand, then center it
            setTimeout(() => {
                const rect = envelope.getBoundingClientRect();
                const targetY = window.scrollY + rect.top + (rect.height / 2) - (window.innerHeight / 2);
                smoothScrollTo(targetY, 1500);
            }, 600);
        });
    }
});
