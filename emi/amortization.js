document.addEventListener('DOMContentLoaded', () => {
    const loanData = JSON.parse(localStorage.getItem('emiData'));
    const tableBody = document.getElementById('table-body');
    const summaryText = document.getElementById('loan-summary-text');
    const btnMonthly = document.getElementById('btn-monthly');
    const btnYearly = document.getElementById('btn-yearly');

    if (!loanData || !loanData.principal || !loanData.rate || !loanData.tenure) {
        tableBody.innerHTML = '<tr><td colspan="4" class="status-message">Please calculate EMI first.</td></tr>';
        return;
    }

    const { principal, rate, tenure, emi } = loanData;
    summaryText.textContent = `Breakdown for Principal ${principal.toLocaleString()} at ${rate}% for ${tenure} Years`;

    let currentView = 'monthly';

    function calculateAmortization() {
        tableBody.innerHTML = '';
        const r = rate / 12 / 100;
        let balance = principal;

        const schedule = [];
        const totalMonths = Math.ceil(tenure * 12);

        for (let i = 1; i <= totalMonths; i++) {
            const interest = balance * r;
            let principalPaid = emi - interest;

            if (i === totalMonths || balance < principalPaid) {
                principalPaid = balance;
            }

            balance -= principalPaid;
            if (balance < 0) balance = 0;

            schedule.push({
                no: i,
                interest: interest,
                principal: principalPaid,
                balance: balance
            });
        }

        if (currentView === 'monthly') {
            renderSchedule(schedule);
        } else {
            renderYearly(schedule);
        }
    }

    function renderSchedule(schedule) {
        schedule.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.no}</td>
                <td>${formatNum(item.interest)}</td>
                <td>${formatNum(item.principal)}</td>
                <td>${formatNum(item.balance)}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    function renderYearly(schedule) {
        let yearlyInterest = 0;
        let yearlyPrincipal = 0;
        let year = 1;

        schedule.forEach((item, index) => {
            yearlyInterest += item.interest;
            yearlyPrincipal += item.principal;

            if ((index + 1) % 12 === 0 || (index + 1) === schedule.length) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>Year ${year}</td>
                    <td>${formatNum(yearlyInterest)}</td>
                    <td>${formatNum(yearlyPrincipal)}</td>
                    <td>${formatNum(item.balance)}</td>
                `;
                tableBody.appendChild(row);

                yearlyInterest = 0;
                yearlyPrincipal = 0;
                year++;
            }
        });
    }

    function formatNum(val) {
        return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    btnMonthly.addEventListener('click', () => {
        currentView = 'monthly';
        btnMonthly.classList.add('active');
        btnYearly.classList.remove('active');
        calculateAmortization();
    });

    btnYearly.addEventListener('click', () => {
        currentView = 'yearly';
        btnYearly.classList.add('active');
        btnMonthly.classList.remove('active');
        calculateAmortization();
    });

    calculateAmortization();

    // PDF & Sharing Logic
    const prepareForPDF = () => {
        const printDate = document.getElementById('printDate');
        if (printDate) {
            printDate.textContent = "Generated on: " + new Date().toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });
        }
        document.body.classList.add('pdf-mode');
        return "Amortization_Report_" + new Date().getTime();
    };

    const cleanupAfterPDF = () => {
        document.body.classList.remove('pdf-mode');
    };

    const generatePDFResult = async () => {
        const reportTitle = prepareForPDF();
        const element = document.querySelector('.container');
        const opt = {
            margin: [10, 5],
            filename: `${reportTitle}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        try {
            // Always generate blob for use with PDFHelper
            const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
            cleanupAfterPDF();
            return { blob: pdfBlob, title: reportTitle };
        } catch (err) {
            cleanupAfterPDF();
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
            console.error(err);
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
            await window.PDFHelper.share(result.blob, `${result.title}.pdf`, 'Amortization Report');
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
});
