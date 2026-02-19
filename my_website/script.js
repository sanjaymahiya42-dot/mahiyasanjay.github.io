 // Scroll reveal observer
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -80px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal');
                }
            });
        }, observerOptions);
        // Gallery Image Click (for future implementation with modal)
        document.querySelectorAll('.gallery-image').forEach(image => {
            image.addEventListener('click', function () {
                // Here you can add modal/lightbox functionality
                console.log('Gallery image clicked - implement modal here');
            });
        });


        // Observe all reveal elements
        document.querySelectorAll('.reveal-element, .section-title, .invitation-card, .profile-card, .function-card, .shayari-content, .blessing-card, .location-card').forEach(el => {
            observer.observe(el);
        });

        // Continuous marigold falling animation
        function createFallingFlower() {
            const container = document.querySelector('.diya-container');
            const flower = document.createElement('div');
            flower.classList.add('marigold');
            flower.textContent = '🌼';
            flower.style.left = Math.random() * 100 + '%';
            flower.style.animationDuration = (Math.random() * 3 + 5) + 's';
            container.appendChild(flower);

            setTimeout(() => {
                flower.remove();
            }, 8000);
        }

        // Add flowers periodically
        setInterval(createFallingFlower, 3000);

        // Smooth scroll for internal navigation (if needed)
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
        document.body.addEventListener("click", function () {
            var music = document.getElementById("bgMusic");
            music.play();
        }, { once: true });
        // / Countdown Timer
        function updateCountdown() {
            const weddingDate = new Date('2026-03-15T09:00:00').getTime();
            const now = new Date().getTime();
            const distance = weddingDate - now;

            const days = Math.floor(distance / (1000 * 60 * 60 * 17));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 17)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            document.getElementById('days').textContent = String(days).padStart(2, '0');
            document.getElementById('hours').textContent = String(hours).padStart(2, '0');
            document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
            document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');

            if (distance < 0) {
                document.getElementById('countdown').innerHTML = '<h3 style="color: var(--gold); font-family: Cinzel, serif;">The Wedding Day Has Arrived! ðŸŽ‰</h3>';
            }
        }
        // Update countdown every second
        setInterval(updateCountdown, 1000);
        updateCountdown(); // Initial call
            
// ===================================
// RSVP FORM SUBMISSION
// ===================================
const rsvpForm = document.getElementById('rsvpForm');
const rsvpSuccess = document.getElementById('rsvpSuccess');

rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form data
    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        guests: document.getElementById('guests').value,
        attendance: document.getElementById('attendance').value,
        message: document.getElementById('message').value
    };

    console.log('RSVP Submitted:', formData);

    // Here you would typically send the data to a server
    // For now, we'll just show the success message

    // Hide form and show success message
    rsvpForm.style.display = 'none';
    rsvpSuccess.classList.add('active');

    // Reset form after 5 seconds
    setTimeout(() => {
        rsvpForm.reset();
        rsvpForm.style.display = 'block';
        rsvpSuccess.classList.remove('active');
    }, 5000);
});

 
