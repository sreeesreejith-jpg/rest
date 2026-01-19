document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('input');

    // Global variable to store stages for navigation
    // Global variable to store stages for navigation
    let payStagesList = [
        23000, 23700, 24400, 25100, 25800, 26500, 27200, 27900, 28700, 29500,
        30300, 31100, 32000, 32900, 33800, 34700, 35600, 36500, 37400, 38300,
        39300, 40300, 41300, 42300, 43400, 44500, 45600, 46700, 47800, 49000,
        50200, 51400, 52600, 53900, 55200, 56500, 57900, 59300, 60700, 62200,
        63700, 65200, 66800, 68400, 70000, 71800, 73600, 75400, 77200, 79000,
        81000, 83000, 85000, 87000, 89000, 91200, 93400, 95600, 97800, 100300,
        102800, 105300, 107800, 110300, 112800, 115300, 118100, 120900, 123700,
        126500, 129300, 132100, 134900, 137700, 140500, 143600, 146700, 149800,
        153200, 156600, 160000, 163400, 166800
    ];

    // --- Custom Dropdown Logic ---
    const basicPay = document.getElementById('basic-pay');
    const dropdown = document.getElementById('custom-dropdown');

    // Store current value
    basicPay.dataset.lastValid = basicPay.value;

    function renderDropdown(filterText = "") {
        dropdown.innerHTML = "";
        const filtered = filterText
            ? payStagesList.filter(stage => stage.toString().startsWith(filterText))
            : payStagesList;

        if (filtered.length === 0) {
            dropdown.classList.remove('show');
            return;
        }

        filtered.forEach(stage => {
            const li = document.createElement('li');
            li.textContent = stage;
            li.addEventListener('mousedown', (e) => {
                e.preventDefault();
                selectValue(stage);
            });
            dropdown.appendChild(li);
        });
    }

    function selectValue(val) {
        basicPay.value = val;
        basicPay.dataset.lastValid = val;
        dropdown.classList.remove('show');
        calculate(); // Call calculation directly
    }

    function showDropdown() {
        renderDropdown("");
        dropdown.classList.add('show');

        const currentVal = parseInt(basicPay.value);
        if (currentVal) {
            const items = Array.from(dropdown.querySelectorAll('li'));
            const match = items.find(li => li.textContent == currentVal);
            if (match) {
                match.scrollIntoView({ block: 'center' });
                match.classList.add('active');
            }
        }
    }

    function hideDropdown() {
        setTimeout(() => {
            dropdown.classList.remove('show');
        }, 150);
    }

    // Input Listeners
    basicPay.addEventListener('focus', function () {
        this.select();
        showDropdown();
    });

    basicPay.addEventListener('click', function () {
        this.select();
        showDropdown();
    });

    basicPay.addEventListener('input', function () {
        // Filter live
        renderDropdown(this.value);
        dropdown.classList.add('show');
        calculate();
    });

    basicPay.addEventListener('blur', function () {
        if (this.value.trim() === "") {
            this.value = this.dataset.lastValid || "";
            calculate();
        }
        hideDropdown();
    });

    // Fetch external data (optional)
    fetch('../data/pay_stages.json')
        .then(response => response.json())
        .then(data => {
            if (data.payStages) {
                payStagesList = data.payStages;
            }
        })
        .catch(err => console.log('Using embedded pay stages'));

    const daPerc = document.getElementById('da-perc');
    const daPendingPerc = document.getElementById('da-pending-perc');
    const hraPerc = document.getElementById('hra-perc');
    const otherEarnings = document.getElementById('other-earnings');

    // Earnings Calculated Displays
    const daVal = document.getElementById('da-val');
    const daPendingVal = document.getElementById('da-pending-val');
    const hraVal = document.getElementById('hra-val');

    // Deductions Inputs
    const gpfSub = document.getElementById('gpf-sub');
    const gis = document.getElementById('gis');
    const sli = document.getElementById('sli');
    const medisep = document.getElementById('medisep');
    const sliLoan = document.getElementById('sli-loan');
    const otherDeductions = document.getElementById('other-deductions');


    // Final Summary Displays
    const grossValDisplay = document.getElementById('gross-salary-val');
    const totalDeductDisplay = document.getElementById('total-deduction-val');
    const netValDisplay = document.getElementById('net-salary-val');

    const grossBottom = document.getElementById('gross-salary-bottom');
    const deductBottom = document.getElementById('total-deduction-bottom');
    const netBottom = document.getElementById('net-salary-bottom');

    function formatAmount(num) {
        return Math.round(num).toString();
    }

    function calculate() {
        const bp = parseFloat(basicPay.value) || 0;
        const daP = parseFloat(daPerc.value) || 0;
        const dapP = parseFloat(daPendingPerc.value) || 0;
        const hrP = parseFloat(hraPerc.value) || 0;
        const otherEarn = parseFloat(otherEarnings.value) || 0;

        // Calculate individual earnings
        const da = bp * (daP / 100);
        const dap = bp * (dapP / 100);
        const hra = bp * (hrP / 100);

        // Update earnings labels
        daVal.innerText = formatAmount(da);
        daPendingVal.innerText = formatAmount(dap);
        hraVal.innerText = formatAmount(hra);

        // Gross Salary
        const gross = bp + da + dap + hra + otherEarn;
        grossValDisplay.innerText = formatAmount(gross);

        // Deductions
        const d1 = parseFloat(gpfSub.value) || 0;
        const d2 = parseFloat(gis.value) || 0;
        const d3 = parseFloat(sli.value) || 0;
        const d4 = parseFloat(medisep.value) || 0;
        const d5 = parseFloat(sliLoan.value) || 0;
        const d6 = parseFloat(otherDeductions.value) || 0;


        const totalDeductions = d1 + d2 + d3 + d4 + d5 + d6;
        totalDeductDisplay.innerText = formatAmount(totalDeductions);

        // Net Salary
        const net = gross - totalDeductions;
        netValDisplay.innerText = formatAmount(net);

        // Update bottom summaries
        if (grossBottom) grossBottom.innerText = formatAmount(gross);
        if (deductBottom) deductBottom.innerText = formatAmount(totalDeductions);
        if (netBottom) netBottom.innerText = formatAmount(net);
    }

    // Add listeners to all inputs
    inputs.forEach(input => {
        input.addEventListener('input', calculate);
    });

    // Initial calculation
    calculate();

    // PDF & Sharing Logic
    const prepareForPDF = () => {
        const printDate = document.getElementById('printDate');
        if (printDate) {
            printDate.textContent = "Generated on: " + new Date().toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });
        }
        document.body.classList.add('pdf-mode');
        return "Salary_Report_" + new Date().getTime();
    };

    const cleanupAfterPDF = () => {
        document.body.classList.remove('pdf-mode');
    };

    const generatePDFResult = async () => {
        try {
            const jsPDFLib = window.jsPDF || (window.jspdf ? window.jspdf.jsPDF : null);
            if (!jsPDFLib) throw new Error("PDF Library not loaded");
            const doc = new jsPDFLib();
            const reportTitle = "Salary_Report_" + new Date().getTime();

            // 1. Header with styling
            doc.setFillColor(16, 185, 129); // Green color from theme
            doc.rect(0, 0, 210, 40, 'F');

            doc.setFontSize(22);
            doc.setTextColor(255);
            doc.setFont("helvetica", "bold");
            doc.text("Salary Calculation Report", 14, 20);

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");

            const name = document.getElementById('reportName')?.value;
            const pen = document.getElementById('penNumber')?.value;
            const school = document.getElementById('schoolName')?.value;

            let headerY = 28;
            if (name) { doc.text(`Employee: ${name}`, 14, headerY); headerY += 5; }
            if (pen) { doc.text(`PEN Number: ${pen}`, 14, headerY); headerY += 5; }
            if (school) { doc.text(`School/Office: ${school}`, 14, headerY); headerY += 5; }


            // 2. Data Extraction
            const bp = document.getElementById('basic-pay').value || "0";
            const daP = document.getElementById('da-perc').value || "0";
            const daV = document.getElementById('da-val').innerText || "0";
            const hraP = document.getElementById('hra-perc').value || "0";
            const hraV = document.getElementById('hra-val').innerText || "0";
            const daPendP = document.getElementById('da-pending-perc').value || "0";
            const daPendV = document.getElementById('da-pending-val').innerText || "0";
            const otherEarn = document.getElementById('other-earnings').value || "0";

            const gross = document.getElementById('gross-salary-val').innerText || "0";
            const deduct = document.getElementById('total-deduction-val').innerText || "0";
            const net = document.getElementById('net-salary-val').innerText || "0";

            // 3. Earnings Table
            doc.setFontSize(14);
            doc.setTextColor(40);
            doc.text("Earnings Details", 14, 50);

            doc.autoTable({
                startY: 55,
                head: [['Component', 'Percentage / Info', 'Amount']],
                body: [
                    ['Basic Pay', '-', 'Rs. ' + bp],
                    ['DA', daP + ' %', 'Rs. ' + daV],
                    ['HRA', hraP + ' %', 'Rs. ' + hraV],
                    ['DA Pending', daPendP + ' %', 'Rs. ' + daPendV],
                    ['Other Earnings', '-', 'Rs. ' + otherEarn],
                    ['Gross Salary', '-', 'Rs. ' + gross]
                ],
                theme: 'striped',
                headStyles: { fillColor: [16, 185, 129] },
                columnStyles: { 2: { halign: 'right' } }
            });

            // 4. Deductions data extraction for table
            const d1 = document.getElementById('gpf-sub').value || "0";
            const d2 = document.getElementById('gis').value || "0";
            const d3 = document.getElementById('sli').value || "0";
            const d4 = document.getElementById('medisep').value || "0";
            const d5 = document.getElementById('sli-loan').value || "0";
            const d6 = document.getElementById('other-deductions').value || "0";

            doc.text("Deductions Details", 14, doc.lastAutoTable.finalY + 15);
            doc.autoTable({
                startY: doc.lastAutoTable.finalY + 20,
                head: [['Component', 'Amount']],
                body: [
                    ['GPF Subscription', 'Rs. ' + d1],
                    ['GIS', 'Rs. ' + d2],
                    ['SLI', 'Rs. ' + d3],
                    ['Medisep', 'Rs. ' + d4],
                    ['SLI Loan', 'Rs. ' + d5],
                    ['Other Deductions', 'Rs. ' + d6],
                    ['Total Deductions', 'Rs. ' + deduct]
                ],
                theme: 'striped',
                headStyles: { fillColor: [239, 68, 68] }, // Red for deductions
                columnStyles: { 1: { halign: 'right' } }
            });

            // 5. Final Summary Table
            doc.text("Final Summary", 14, doc.lastAutoTable.finalY + 15);
            doc.autoTable({
                startY: doc.lastAutoTable.finalY + 20,
                body: [
                    ['Gross Salary', 'Rs. ' + gross],
                    ['Total Deductions', 'Rs. ' + deduct],
                    ['Net Salary', 'Rs. ' + net]
                ],
                theme: 'grid',
                styles: { fontSize: 12, fontStyle: 'bold' },
                columnStyles: { 1: { halign: 'right' } }
            });

            // 6. Footer
            const finalY = doc.lastAutoTable.finalY + 20;
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text("Email: sreee.sreejith@gmail.com", 14, finalY);

            // 7. Output Management
            const cap = window.Capacitor;
            const isNative = !!(cap && cap.Plugins && (cap.Plugins.Filesystem || cap.Plugins.Share));

            return { blob: doc.output('blob'), title: reportTitle };
        } catch (err) {
            console.error("Salary PDF Error:", err);
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
            console.log('Starting PDF generation for download...');
            const result = await generatePDFResult();
            console.log('PDF generated successfully:', result);

            if (!result || !result.blob) {
                throw new Error('PDF generation failed - no blob returned');
            }

            console.log('Calling PDFHelper.download...');
            await window.PDFHelper.download(result.blob, `${result.title}.pdf`);
            console.log('Download initiated successfully');
        } catch (err) {
            console.error("Download error:", err);
            alert("Error generating PDF for download: " + err.message);
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
            console.log('Starting PDF generation for sharing...');
            const result = await generatePDFResult();
            console.log('PDF generated successfully:', result);

            if (!result || !result.blob) {
                throw new Error('PDF generation failed - no blob returned');
            }

            console.log('Calling PDFHelper.share...');
            const shareResult = await window.PDFHelper.share(result.blob, `${result.title}.pdf`, 'Salary Report');
            console.log('Share completed:', shareResult);
        } catch (err) {
            console.error("Share error:", err);
            // Only alert if it's not an AbortError (user cancelled)
            if (err.name !== 'AbortError' && !err.toString().includes('AbortError')) {
                alert("Sharing failed: " + err.message + ". Try 'Download PDF' instead.");
            }
        } finally {
            if (btn) {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }
    };

    const downloadButton = document.getElementById('downloadBtn');
    if (downloadButton) downloadButton.addEventListener('click', downloadPDF);

    const shareButton = document.getElementById('shareBtn');
    if (shareButton) shareButton.addEventListener('click', sharePDF);

    const printBtn = document.getElementById('printBtn');
    if (printBtn) {
        printBtn.style.display = 'none';
    }
});
