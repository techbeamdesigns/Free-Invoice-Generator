document.addEventListener('DOMContentLoaded', () => {

    // --- STATE MANAGEMENT ---
    const state = {
        invoiceNumber: 'INV-001',
        date: new Date().toISOString().split('T')[0],
        currency: 'USD',
        logoUrl: null,
        payment: {
            upiId: 'jabir84@fifederal',
            qrUrl: 'qr-code.jpg' // Default local file
        },
        sender: {
            name: 'Techbeamdesigns',
            email: 'contact@techbeamdesigns.com',
            address: '123 Creative Ave, Design City, DC 90210'
        },
        client: {
            name: 'Acme Corp',
            email: 'accounts@acme.com',
            address: '456 Enterprise Blvd, Tech Park, TP 5000'
        },
        items: [
            { id: 1, desc: 'Web Design Project', sub: 'Homepage and Landing Page Design', qty: 1, price: 1500 },
            { id: 2, desc: 'SEO Optimization', sub: 'Keyword research and on-page optimization', qty: 5, price: 100 }
        ],
        taxRate: 10,
        notes: 'Payment due within 14 days. Thank you for your business!'
    };

    // --- DOM REFERENCES ---
    const inputs = {
        invoiceNumber: document.getElementById('invoiceNumber'),
        date: document.getElementById('invoiceDate'),
        currency: document.getElementById('currencySelect'),
        logo: document.getElementById('logoInput'),
        upiId: document.getElementById('upiId'),
        qr: document.getElementById('qrInput'),
        senderName: document.getElementById('senderName'),
        senderEmail: document.getElementById('senderEmail'),
        senderAddress: document.getElementById('senderAddress'),
        clientName: document.getElementById('clientName'),
        clientEmail: document.getElementById('clientEmail'),
        clientAddress: document.getElementById('clientAddress'),
        taxRate: document.getElementById('taxRate'),
        notes: document.getElementById('notes')
    };

    const ui = {
        logoFileName: document.getElementById('logoFileName'),
        removeLogoBtn: document.getElementById('removeLogoBtn'),
        qrFileName: document.getElementById('qrFileName'),
        removeQrBtn: document.getElementById('removeQrBtn')
    };

    const preview = {
        invoiceNumber: document.getElementById('p_invoiceNumber'),
        date: document.getElementById('p_invoiceDate'),
        logo: document.getElementById('p_logo'),
        senderName: document.getElementById('p_senderName'),
        senderEmail: document.getElementById('p_senderEmail'),
        senderAddress: document.getElementById('p_senderAddress'),
        clientName: document.getElementById('p_clientName'),
        clientEmail: document.getElementById('p_clientEmail'),
        clientAddress: document.getElementById('p_clientAddress'),
        itemsBody: document.getElementById('p_itemsBody'),
        subtotal: document.getElementById('p_subtotal'),
        taxRate: document.getElementById('p_taxRate'),
        taxAmount: document.getElementById('p_taxAmount'),
        total: document.getElementById('p_total'),
        notes: document.getElementById('p_notes'),
        upiId: document.getElementById('p_upiId'),
        qrCode: document.getElementById('p_qrCode')
    };

    const container = {
        items: document.getElementById('itemsContainer')
    };

    const buttons = {
        add: document.getElementById('addItemBtn'),
        print: document.getElementById('printBtn')
    };

    // --- INITIALIZATION ---
    function init() {
        // Set initial validation values
        inputs.date.value = state.date;
        inputs.currency.value = state.currency;
        inputs.upiId.value = state.payment.upiId;

        // Render initial UI
        renderItemsForm();
        updatePreview();

        // Attach Listeners
        attachListeners();
    }

    // --- CORE LOGIC ---

    function calculateTotal() {
        const subtotal = state.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
        const taxAmount = subtotal * (state.taxRate / 100);
        const total = subtotal + taxAmount;
        return { subtotal, taxAmount, total };
    }

    function formatCurrency(num) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: state.currency
        }).format(num);
    }

    // --- RENDER FUNCTIONS ---

    function renderItemsForm() {
        container.items.innerHTML = '';
        state.items.forEach(item => {
            const row = document.createElement('div');
            row.className = 'item-row';
            row.innerHTML = `
                <div class="item-inputs">
                    <input type="text" placeholder="Item Name" value="${item.desc}" data-id="${item.id}" data-field="desc">
                    <input type="text" placeholder="Description (optional)" value="${item.sub || ''}" data-id="${item.id}" data-field="sub" style="font-size: 0.8rem; opacity: 0.8;">
                </div>
                <input type="number" placeholder="Qty" value="${item.qty}" min="1" data-id="${item.id}" data-field="qty">
                <input type="number" placeholder="Price" value="${item.price}" min="0" step="0.01" data-id="${item.id}" data-field="price">
                <button class="btn btn-danger" onclick="removeItem(${item.id})">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
            `;
            container.items.appendChild(row);
        });

        // Re-attach listeners to new inputs
        document.querySelectorAll('.item-row input').forEach(input => {
            input.addEventListener('input', handleItemChange);
        });
    }

    function updatePreview() {
        // Logo
        if (state.logoUrl) {
            preview.logo.src = state.logoUrl;
            preview.logo.classList.remove('hidden');
        } else {
            preview.logo.src = '';
            preview.logo.classList.add('hidden');
        }

        // Payment
        preview.upiId.textContent = state.payment.upiId;
        preview.qrCode.src = state.payment.qrUrl;

        // Sync Text Fields
        preview.invoiceNumber.textContent = state.invoiceNumber;
        preview.date.textContent = state.date;
        preview.senderName.textContent = state.sender.name || 'Company Name';
        preview.senderEmail.textContent = state.sender.email;
        preview.senderAddress.textContent = state.sender.address;
        preview.clientName.textContent = state.client.name || 'Client Name';
        preview.clientEmail.textContent = state.client.email;
        preview.clientAddress.textContent = state.client.address;
        preview.notes.textContent = state.notes;
        preview.taxRate.textContent = state.taxRate;

        // Sync Items
        preview.itemsBody.innerHTML = state.items.map(item => `
            <tr>
                <td>
                    <span class="item-name">${item.desc || 'Item'}</span>
                    ${item.sub ? `<span class="item-desc">${item.sub}</span>` : ''}
                </td>
                <td class="col-qty">${item.qty}</td>
                <td class="col-price">${formatCurrency(item.price)}</td>
                <td class="col-total">${formatCurrency(item.qty * item.price)}</td>
            </tr>
        `).join('');

        // Sync Totals
        const { subtotal, taxAmount, total } = calculateTotal();
        preview.subtotal.textContent = formatCurrency(subtotal);
        preview.taxAmount.textContent = formatCurrency(taxAmount);
        preview.total.textContent = formatCurrency(total);
    }

    // --- EVENT HANDLERS ---

    function handleInput(e, path) {
        // Simple path update (e.g., 'sender.name') or Payment path
        const value = e.target.value;
        const keys = path.split('.');
        if (keys.length === 1) {
            state[keys[0]] = value;
        } else if (keys.length === 2) {
            state[keys[0]][keys[1]] = value;
        }
        updatePreview();
    }

    function handleItemChange(e) {
        const id = parseInt(e.target.dataset.id);
        const field = e.target.dataset.field;
        const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;

        const item = state.items.find(i => i.id === id);
        if (item) {
            item[field] = value;
            updatePreview();
        }
    }

    // File Handlers (Logo & QR)
    function handleFileUpload(e, type) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                if (type === 'logo') {
                    state.logoUrl = event.target.result;
                    ui.logoFileName.textContent = file.name;
                    ui.removeLogoBtn.classList.remove('hidden');
                } else if (type === 'qr') {
                    state.payment.qrUrl = event.target.result;
                    ui.qrFileName.textContent = file.name;
                    ui.removeQrBtn.classList.remove('hidden');
                }
                updatePreview();
            };
            reader.readAsDataURL(file);
        }
    }

    function removeLogo() {
        state.logoUrl = null;
        inputs.logo.value = ''; // Reset input
        ui.logoFileName.textContent = 'Choose Logo...';
        ui.removeLogoBtn.classList.add('hidden');
        updatePreview();
    }

    function removeQr() {
        state.payment.qrUrl = 'qr-code.jpg'; // Revert to default
        inputs.qr.value = '';
        ui.qrFileName.textContent = 'Use Default QR';
        ui.removeQrBtn.classList.add('hidden');
        updatePreview();
    }

    // Exposed globally for the inline onclick handler
    window.removeItem = function (id) {
        state.items = state.items.filter(i => i.id !== id);
        renderItemsForm();
        updatePreview();
    };

    function addItem() {
        const newId = state.items.length > 0 ? Math.max(...state.items.map(i => i.id)) + 1 : 1;
        state.items.push({ id: newId, desc: '', sub: '', qty: 1, price: 0 });
        renderItemsForm();
        updatePreview(); // To show empty row in preview if desired, or at least update totals
    }

    function handlePrint() {
        window.print();
    }

    function attachListeners() {
        // Inputs
        inputs.invoiceNumber.addEventListener('input', (e) => handleInput(e, 'invoiceNumber'));
        inputs.date.addEventListener('input', (e) => handleInput(e, 'date'));
        inputs.currency.addEventListener('change', (e) => handleInput(e, 'currency'));

        // Theme
        const themeSelect = document.getElementById('themeSelect');
        themeSelect.addEventListener('change', (e) => {
            document.body.setAttribute('data-theme', e.target.value);
        });

        inputs.upiId.addEventListener('input', (e) => handleInput(e, 'payment.upiId'));

        // Files
        inputs.logo.addEventListener('change', (e) => handleFileUpload(e, 'logo'));
        ui.removeLogoBtn.addEventListener('click', removeLogo);

        inputs.qr.addEventListener('change', (e) => handleFileUpload(e, 'qr'));
        ui.removeQrBtn.addEventListener('click', removeQr);

        inputs.senderName.addEventListener('input', (e) => handleInput(e, 'sender.name'));
        inputs.senderEmail.addEventListener('input', (e) => handleInput(e, 'sender.email'));
        inputs.senderAddress.addEventListener('input', (e) => handleInput(e, 'sender.address'));
        inputs.clientName.addEventListener('input', (e) => handleInput(e, 'client.name'));
        inputs.clientEmail.addEventListener('input', (e) => handleInput(e, 'client.email'));
        inputs.clientAddress.addEventListener('input', (e) => handleInput(e, 'client.address'));
        inputs.taxRate.addEventListener('input', (e) => handleInput(e, 'taxRate'));
        inputs.notes.addEventListener('input', (e) => handleInput(e, 'notes'));

        // Buttons
        buttons.add.addEventListener('click', addItem);
        buttons.print.addEventListener('click', handlePrint);
    }

    // Run
    init();
});
