export function createOnboarding() {
  if (localStorage.getItem('fc-onboarded')) return

  const overlay = document.createElement('div')
  overlay.className = 'onboarding-overlay'
  overlay.innerHTML = `
    <div class="onboarding-card">
      <h2>Welcome to Fractal Family Tree</h2>
      <p>
        Build and explore your family tree with fractal visualization.
        Click any person to center the tree on them. Use the + icon to add
        relatives and the pencil icon to edit details.<br><br>
        Spouses and in-laws appear smaller, creating a fractal pattern
        you can zoom into infinitely.
      </p>
      <button class="fc-btn fc-btn-primary" id="onboarding-start">Get Started</button>
    </div>
  `
  document.body.appendChild(overlay)

  overlay.querySelector('#onboarding-start').addEventListener('click', () => {
    localStorage.setItem('fc-onboarded', '1')
    overlay.style.opacity = '0'
    overlay.style.transition = 'opacity 0.3s ease'
    setTimeout(() => overlay.remove(), 300)
  })
}
