document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.getElementById('menu-button');
    const dropdownMenu = document.querySelector('[role="menu"]');
  
    if (!menuButton || !dropdownMenu) {
      console.error('Dropdown elements not found');
      return;
    }
  
    // Toggle dropdown visibility
    menuButton.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent immediate closing
      const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', !isExpanded);
      dropdownMenu.classList.toggle('hidden');
    });
  
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      menuButton.setAttribute('aria-expanded', 'false');
      dropdownMenu.classList.add('hidden');
    });
  });