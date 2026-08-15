// Multimeter Anatomy Explorer — accessibility and presentation layer
// CANVAS_HEIGHT: 760
//
// The infographic is rendered by ../shared-libs/grid-diagram.js from data.json.
// This file adds keyboard access to each labelled part and opens on the dial,
// because choosing the right mode is the decision students get wrong first.

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

    sim._showZoneDetail('dial');
  };

  enhanceZones();
});
