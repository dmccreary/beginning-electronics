// IC Preview (555 Timer and 74HC595) — accessibility and presentation layer
// CANVAS_HEIGHT: 700
//
// The infographic is rendered by ../shared-libs/grid-diagram.js from data.json.
// This file adds keyboard access to the two chip zones. It deliberately does
// NOT pre-open a chip: the chapter wants students to look at the two packages
// and count pins before reading what either one does.

document.addEventListener('DOMContentLoaded', () => {
  const enhanceZones = () => {
    if (!sim.data || document.querySelectorAll('.grid-zone').length === 0) {
      window.requestAnimationFrame(enhanceZones);
      return;
    }

    document.querySelectorAll('.grid-zone').forEach((zone) => {
      const item = sim.data.zones.find((entry) => entry.id === zone.dataset.id);
      if (!item) return;

      zone.tabIndex = 0;
      zone.setAttribute('role', 'button');
      zone.setAttribute('aria-label', item.label + ': ' + item.summary);
      zone.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          zone.click();
        }
      });
    });
  };

  enhanceZones();
});
