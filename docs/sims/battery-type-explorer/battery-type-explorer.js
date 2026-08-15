// Battery Type Explorer — accessibility and presentation enhancements
// CANVAS_HEIGHT: 720

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

    // Start with a full example visible so the comparison data is immediately clear.
    sim._showZoneDetail('coin-cell');
  };

  enhanceZones();
});
