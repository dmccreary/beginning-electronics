// comparison-explorer.js — keyboard and initial-state enhancements for grid comparisons
// Each page supplies its initial example with <body data-first-zone="...">.

document.addEventListener('DOMContentLoaded', () => {
  const enhanceZones = () => {
    if (typeof sim === 'undefined' || !sim.data || document.querySelectorAll('.grid-zone').length === 0) {
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

    const firstZone = document.body.dataset.firstZone;
    if (firstZone) sim._showZoneDetail(firstZone);
  };

  enhanceZones();
});
