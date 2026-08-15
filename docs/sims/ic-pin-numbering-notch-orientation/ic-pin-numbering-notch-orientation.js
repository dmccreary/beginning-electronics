// IC Pin Numbering and Notch Orientation — accessibility and presentation layer
// CANVAS_HEIGHT: 720
//
// The infographic is rendered by ../shared-libs/grid-diagram.js from data.json.
// This file adds keyboard access to every pin zone and opens on the notch,
// because "find the notch first" is the habit the whole chapter is teaching.

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

    sim._showZoneDetail('notch');
  };

  enhanceZones();
});
