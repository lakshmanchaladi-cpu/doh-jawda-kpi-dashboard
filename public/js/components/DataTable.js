export class DataTable {
  static render({ headers, rows, id = '', className = 'table-hover' }) {
    const thead = headers.map(h => `<th>${h}</th>`).join('');
    const tbody = rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('');
    
    return `
      <div class="table-responsive">
        <table class="table table-sm ${className} mb-0 align-middle" ${id ? `id="${id}"` : ''} style="font-size:0.85rem;">
          <thead class="table-light">
            <tr>${thead}</tr>
          </thead>
          <tbody>
            ${tbody || '<tr><td colspan="100%" class="text-center text-muted py-4">No data available</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  }
}
