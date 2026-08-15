// LED Color and Viewing Angle Explorer — accessibility and presentation layer
// CANVAS_HEIGHT: 720
//
// The infographic itself is rendered by ../shared-libs/grid-diagram.js from
// data.json. This file only adds keyboard access to the zones and opens on a
// worked example so the comparison data is visible before any interaction.

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

    // Open on red: it is the color students meet first and the one the
    // chapter's worked resistor calculation uses.
    sim._showZoneDetail('red-led');
  };

  enhanceZones();
});
