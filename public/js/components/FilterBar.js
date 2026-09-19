export class FilterBar {
  static render({ filters = [], onFilter = '' }) {
    const buttons = filters.map(f => `
      <button class="btn btn-outline-secondary btn-sm ${f.active ? 'active' : ''}" 
              data-filter="${f.value}" 
              onclick="${onFilter}">
        ${f.icon ? `<i class="bi ${f.icon} me-1"></i>` : ''}${f.label}
      </button>
    `).join('');

    return `
      <div class="btn-group mb-3 filter-bar shadow-sm" role="group">
        ${buttons}
      </div>
    `;
  }
}
