// Ensure there's a logo element with id 'logo-accessone' that links to index.html
(function(){
  function ensureLogo() {
  // Only apply the fancy wrapper on the index page or when a header-accessone container exists
  const isIndex = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '';
  const header = document.querySelector('.header-accessone');
  if (!isIndex && !header) return; // do nothing on other pages

  const container = header || document.querySelector('.container') || document.body;

    let existing = document.getElementById('logo-accessone');

    // If it's already wrapped, just attach behavior and return
    if (existing && existing.parentElement && existing.parentElement.classList.contains('logo-wrapper')) {
      attachBehavior(existing.parentElement);
      return;
    }

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'logo-wrapper';
    wrapper.setAttribute('role', 'link');
    wrapper.setAttribute('aria-label', 'Inicio - AccessOne');
    wrapper.tabIndex = 0;

    if (existing) {
      // If there's an existing img, keep its src and move it inside the wrapper
      const img = existing;
      img.draggable = false;
      // ensure id remains
      img.id = 'logo-accessone';
      wrapper.appendChild(img);
      // place wrapper where the original image was (replace)
      const parent = img.parentElement;
      if (parent) parent.replaceChild(wrapper, img);
      else if (container.firstChild) container.insertBefore(wrapper, container.firstChild);
      else container.appendChild(wrapper);
    } else {
      // create new image and insert; prefer PNG but fallback to JPG if PNG doesn't load
      const img = document.createElement('img');
      img.id = 'logo-accessone';
      img.alt = 'AccessOne';
      img.draggable = false;
      // try PNG first; on error, switch to JPG
      img.src = 'logo.png';
      img.addEventListener('error', function onErr() {
        if (img.src && img.src.indexOf('logo.png') !== -1) {
          img.removeEventListener('error', onErr);
          img.src = 'logo.jpg';
        }
      });
      wrapper.appendChild(img);
      if (container.firstChild) container.insertBefore(wrapper, container.firstChild);
      else container.appendChild(wrapper);
    }

    attachBehavior(wrapper);
  }

  function attachBehavior(wrapper) {
    wrapper.onclick = () => { window.location.href = 'index.html'; };
    wrapper.addEventListener('keypress', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        wrapper.click();
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensureLogo);
  else ensureLogo();
})();
