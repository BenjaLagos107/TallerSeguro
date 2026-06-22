import os

with open('main.js', 'r', encoding='utf-8') as f:
    js = f.read()

target = """    if (window.userVehicles && window.userVehicles.length > 0) {
        vehiculoSelect.innerHTML = '<option value="new">Ingresar nuevo vehículo...</option>';
        window.userVehicles.forEach(v => {
            const option = document.createElement('option');
            option.value = v.patente;
            option.textContent = `${v.marca} ${v.modelo} (${v.patente})`;
            option.dataset.marca = v.marca;
            option.dataset.modelo = v.modelo;
            option.dataset.patente = v.patente;
            option.dataset.km = v.kilometraje || '';
            vehiculoSelect.appendChild(option);
        });"""

replacement = """    if (window.userVehicles && window.userVehicles.length > 0) {
        vehiculoSelect.innerHTML = '';
        window.userVehicles.forEach(v => {
            const option = document.createElement('option');
            option.value = v.patente;
            option.textContent = `${v.marca} ${v.modelo} (${v.patente})`;
            option.dataset.marca = v.marca;
            option.dataset.modelo = v.modelo;
            option.dataset.patente = v.patente;
            option.dataset.km = v.kilometraje || '';
            vehiculoSelect.appendChild(option);
        });
        
        const newOption = document.createElement('option');
        newOption.value = 'new';
        newOption.textContent = 'Ingresar nuevo vehículo...';
        vehiculoSelect.appendChild(newOption);"""

js = js.replace(target, replacement)

target2 = """                kmInput.value = km ? parseInt(km, 10).toLocaleString('es-CL') : '';
            }
        };
        
        vehiculoSelectorContainer.classList.remove('hidden');
    } else {"""

replacement2 = """                kmInput.value = km ? parseInt(km, 10).toLocaleString('es-CL') : '';
            }
        };
        
        vehiculoSelect.selectedIndex = 0;
        vehiculoSelect.dispatchEvent(new Event('change'));
        
        vehiculoSelectorContainer.classList.remove('hidden');
    } else {"""

js = js.replace(target2, replacement2)

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("done auto-filling vehicle")
