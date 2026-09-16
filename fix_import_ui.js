const fs = require('fs');
let code = fs.readFileSync('public/js/import.js', 'utf8');

const misleadingBlock = `      <!-- Process / Recalculate KPIs Top Bar -->
      <div class="card shadow-sm border-0 mb-4 bg-primary text-white">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>
            <h5 class="mb-0 fw-bold"><i class="bi bi-cpu me-2"></i> JAWDA Engine Processor</h5>
            <p class="small mb-0 opacity-75">Manually recalculate all KPIs for the currently selected quarter and facility.</p>
          </div>
          <button class="btn btn-light fw-bold text-primary px-4 shadow-sm" onclick="App.navigate('dashboard');">
            <i class="bi bi-play-circle-fill me-1"></i> Proceed to Engine Calculation
          </button>
        </div>
      </div>`;

if (code.includes(misleadingBlock)) {
  code = code.replace(misleadingBlock, '');
  fs.writeFileSync('public/js/import.js', code);
  console.log('Removed misleading block');
} else {
  console.log('Block not found');
}
