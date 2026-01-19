const fields = {
    investment: document.getElementById('investment'),
    rate: document.getElementById('rate'),
    years: document.getElementById('years')
};

const display = {
    card: document.getElementById('result-card'),
    total: document.getElementById('total-value'),
    invested: document.getElementById('invested-amount'),
    returns: document.getElementById('est-returns')
};

// Clear inputs on load
window.addEventListener('load', () => {
    Object.values(fields).forEach(f => f.value = '');
    display.card.classList.remove('visible');
});

function formatAmount(num) {
    return Math.round(num).toString();
}

function calculate() {
    const P = parseFloat(fields.investment.value);
    const R = parseFloat(fields.rate.value);
    const Y = parseFloat(fields.years.value);

    if (!P || !R || !Y || P <= 0 || R <= 0 || Y <= 0) {
        display.card.classList.remove('visible');
        return;
    }

    // Monthly Rate
    const i = R / 12 / 100;
    // Total Months
    const n = Y * 12;

    // SIP Formula: P * [ (1+i)^n - 1 ] / i * (1+i)
    const totalValue = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const investedAmount = P * n;
    const estReturns = totalValue - investedAmount;

    // Update UI
    display.total.textContent = formatAmount(totalValue);
    display.invested.textContent = formatAmount(investedAmount);
    display.returns.textContent = formatAmount(estReturns);

    display.card.classList.add('visible');
}

Object.values(fields).forEach(field => {
    field.addEventListener('input', calculate);
});

// PDF & Sharing Logic

const cleanupAfterPDF = () => {
    document.body.classList.remove('pdf-mode');
};

const generatePDFResult = async () => {
    try {
        const jsPDFLib = window.jsPDF || (window.jspdf ? window.jspdf.jsPDF : null);
        if (!jsPDFLib) throw new Error("PDF Library not loaded");
        const doc = new jsPDFLib();
        const reportTitle = "SIP_Report_" + new Date().getTime();

        // 1. Header & Title 
        doc.setFillColor(16, 185, 129); // Green theme
        doc.rect(0, 0, 210, 40, 'F');

        doc.setFontSize(22);
        doc.setTextColor(255);
        doc.setFont("helvetica", "bold");
        doc.text("SIP Calculation Report", 14, 20);


        // 2. Data Extraction
        const mon = fields.investment.value || "0";
        const rat = fields.rate.value || "0";
        const yrs = fields.years.value || "0";
        const mat = display.total.textContent || "0";
        const inv = display.invested.textContent || "0";
        const ret = display.returns.textContent || "0";

        // 3. Table generation
        doc.autoTable({
            startY: 50,
            head: [['Investment Parameter', 'Detail']],
            body: [
                ['Monthly Investment', 'Rs. ' + mon],
                ['Expected Return Rate', rat + ' %'],
                ['Time Period', yrs + ' Years'],
                ['Total Invested Amount', 'Rs. ' + inv],
                ['Estimated Returns (Wealth Gain)', 'Rs. ' + ret],
                ['Net Maturity Value', 'Rs. ' + mat]
            ],
            theme: 'striped',
            headStyles: { fillColor: [16, 185, 129], fontSize: 13 },
            styles: { fontSize: 12, cellPadding: 6 },
            columnStyles: {
                0: { fontStyle: 'bold' },
                1: { halign: 'right' }
            }
        });

        // 4. Footer
        const finalY = doc.lastAutoTable.finalY + 20;
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Email: sreee.sreejith@gmail.com", 14, finalY);
        doc.text("* Note: Mutual fund investments are subject to market risks.", 14, finalY + 7);

        // 5. Output Check
        const cap = window.Capacitor;
        const isNative = !!(cap && cap.Plugins && (cap.Plugins.Filesystem || cap.Plugins.Share));

        return { blob: doc.output('blob'), title: reportTitle };
    } catch (err) {
        console.error("SIP PDF Error:", err);
        throw err;
    }
};

const downloadPDF = async () => {
    const btn = document.getElementById('downloadBtn');
    const originalText = btn?.innerHTML || "Download";
    if (btn) {
        btn.innerHTML = "<span>⏳</span> Saving...";
        btn.disabled = true;
    }

    try {
        const result = await generatePDFResult();
        await window.PDFHelper.download(result.blob, `${result.title}.pdf`);
    } catch (err) {
        alert("Error generating PDF for download.");
    } finally {
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
};

const sharePDF = async () => {
    const btn = document.getElementById('shareBtn');
    const originalText = btn?.innerHTML || "Share";
    if (btn) {
        btn.innerHTML = "<span>⏳</span> Sharing...";
        btn.disabled = true;
    }

    try {
        const result = await generatePDFResult();
        await window.PDFHelper.share(result.blob, `${result.title}.pdf`, 'SIP Report');
    } catch (err) {
        console.error("Share error:", err);
        if (err.name !== 'AbortError' && !err.toString().includes('AbortError')) {
            alert("Sharing failed. Try 'Download PDF' instead.");
        }
    } finally {
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
};

const dBtn = document.getElementById('downloadBtn');
if (dBtn) dBtn.addEventListener('click', downloadPDF);

const sBtn = document.getElementById('shareBtn');
if (sBtn) sBtn.addEventListener('click', sharePDF);

const printBtn = document.getElementById('printBtn');
if (printBtn) {
    printBtn.style.display = 'none';
}
