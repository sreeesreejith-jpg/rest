/**
 * Kerala Pension & DCRG Calculator Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Input elements
    const basicPayInput = document.getElementById('basicPay');
    const daPercentageInput = document.getElementById('daPercentage');
    const serviceYearsInput = document.getElementById('serviceYears');
    const retirementAgeInput = document.getElementById('retirementAge');
    const avgEmolumentsInput = document.getElementById('avgEmoluments');

    // Display elements
    const pensionAmountDisplay = document.getElementById('pensionAmount');
    const drAmountDisplay = document.getElementById('drAmount');

    // Global variable to store stages
    // Global variable to store stages
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

    // Global variable to store commutation factors
    let commutationFactors = {
        "17": 19.2, "18": 19.11, "19": 19.01, "20": 18.91,
        "21": 18.81, "22": 18.7, "23": 18.59, "24": 18.47, "25": 18.34,
        "26": 18.21, "27": 18.07, "28": 17.93, "29": 17.78, "30": 17.62,
        "31": 17.46, "32": 17.29, "33": 17.11, "34": 16.92, "35": 16.72,
        "36": 16.52, "37": 16.31, "38": 16.09, "39": 15.87, "40": 15.64,
        "41": 15.4, "42": 15.15, "43": 14.9, "44": 14.64, "45": 14.37,
        "46": 14.1, "47": 13.82, "48": 13.54, "49": 13.25, "50": 12.95,
        "51": 12.66, "52": 12.35, "53": 12.05, "54": 11.73, "55": 11.42,
        "56": 11.1, "57": 10.78, "58": 10.46, "59": 10.13, "60": 9.81,
        "61": 9.48, "62": 9.15, "63": 8.82, "64": 8.5, "65": 8.17,
        "66": 7.85, "67": 7.53, "68": 7.22, "69": 6.91, "70": 6.6,
        "71": 6.3, "72": 6.01, "73": 5.72, "74": 5.44, "75": 5.17,
        "76": 4.9, "77": 4.65, "78": 4.4, "79": 4.17, "80": 3.94,
        "81": 3.72, "82": 3.52, "83": 3.32, "84": 3.13
    };

    // --- Custom Dropdown Logic ---
    const dropdown = document.getElementById('custom-dropdown');

    // Store current value
    basicPayInput.dataset.lastValid = basicPayInput.value;

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
        basicPayInput.value = val;
        basicPayInput.dataset.lastValid = val;
        dropdown.classList.remove('show');
        calculateAll(); // Call calculation directly
    }

    function showDropdown() {
        renderDropdown("");
        dropdown.classList.add('show');

        const currentVal = parseInt(basicPayInput.value);
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
    basicPayInput.addEventListener('focus', function () {
        this.select();
        showDropdown();
    });

    basicPayInput.addEventListener('click', function () {
        this.select();
        showDropdown();
    });

    basicPayInput.addEventListener('input', function () {
        // Filter live
        renderDropdown(this.value);
        dropdown.classList.add('show');
        calculateAll();
    });

    basicPayInput.addEventListener('blur', function () {
        if (this.value.trim() === "") {
            this.value = this.dataset.lastValid || "";
            calculateAll();
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

    // Commutation factors are now embedded above. Fetch removed to support local usage.

    const totalMonthlyPensionDisplay = document.getElementById('totalMonthlyPension');
    const commutationAmountDisplay = document.getElementById('commutationAmount');
    const balancePensionDisplay = document.getElementById('balancePension');
    const dcrgAmountDisplay = document.getElementById('dcrgAmount');
    const totalBenefitsDisplay = document.getElementById('totalBenefits');
    const netMonthlyPensionDisplay = document.getElementById('netMonthlyPension');
    const pensionFactorVal = document.getElementById('pensionFactorVal');
    const dcrgFactorVal = document.getElementById('dcrgFactorVal');

    // Dashboard elements
    const totalBenefitsHeader = document.getElementById('totalBenefitsHeader');
    const commuteHeader = document.getElementById('commuteHeader');
    const dcrgHeader = document.getElementById('dcrgHeader');
    const balanceHeader = document.getElementById('balanceHeader');

    // Details elements 
    const calcLastPay = document.getElementById('calcLastPay');
    const calcQS = document.getElementById('calcQS');
    const calcAvgEmoluments = document.getElementById('calcAvgEmoluments');
    const calcBasicPension = document.getElementById('calcBasicPension');
    const calcCommutation = document.getElementById('calcCommutation');
    const calcReducedPension = document.getElementById('calcReducedPension');
    const calcCommutablePension = document.getElementById('calcCommutablePension');
    const calcDcrg = document.getElementById('calcDcrg');
    const dispCommFactor = document.getElementById('dispCommFactor');

    // Step Elements
    const stepDcrg = document.getElementById('stepDcrg');
    const stepCommutation = document.getElementById('stepCommutation');
    const stepPension = document.getElementById('stepPension');
    const stepReduced = document.getElementById('stepReduced');

    const inputs = [basicPayInput, daPercentageInput, serviceYearsInput, retirementAgeInput, avgEmolumentsInput];

    /**
     * Format number without commas
     */
    const formatAmount = (num) => {
        return Math.round(num).toString();
    };

    /**
     * Main calculation function
     */
    const calculateAll = (source) => {
        const bp = parseFloat(basicPayInput.value) || 0;
        const da = parseFloat(daPercentageInput.value) || 0;
        let years = parseFloat(serviceYearsInput.value) || 0;

        // Validation & Constraints
        if (years > 33) years = 33; // Max DCRG service is 33
        // Note: Rules say min 10, but we process whatever is there for instant feedback

        // 1. Last Pay (for DCRG)
        const lastPay = bp + (bp * da / 100);

        // 2. Average Emoluments (for Pension)
        let avgEmoluments;
        if (source === 'ae') {
            // If user manually edited AE, use that value
            avgEmoluments = parseFloat(avgEmolumentsInput.value) || 0;
        } else {
            // Default calculation (Basic Pay ONLY for Pension)
            avgEmoluments = bp;
            avgEmolumentsInput.value = Math.round(avgEmoluments);
        }

        // 3. Pension Calculation
        // Rules: Max 30 years counts for full pension
        let pensionQS = (years > 30) ? 30 : years;
        let pensionFactor = pensionQS / 30;
        if (pensionFactor > 1.0) pensionFactor = 1.0;

        let pension = (avgEmoluments / 2) * pensionFactor;

        // Apply Service Pension Limits
        if (pension < 11500 && pension > 0) pension = 11500;
        if (pension > 83400) pension = 83400;

        // 4. Pension Commutation
        // Formula: 40% of Basic Pension * Factor * 12
        const age = parseInt(retirementAgeInput.value);
        const commFactor = (age && commutationFactors[age]) ? commutationFactors[age] : 0;

        const commutablePension = pension * 0.40;
        const commutationAmount = commutablePension * commFactor * 12;

        const balancePension = pension - commutablePension; // Reduced pension is 60%

        // 6. DCRG Calculation
        // Formula: (Last Pay) * (Qualifying Service / 2)
        // Rule: Max 33 years
        let dcrgQS = (years > 33) ? 33 : years;
        let dcrg = lastPay * (dcrgQS / 2);

        if (dcrg > 1700000) dcrg = 1700000;

        // 7. Total Benefits
        const totalLumpSum = commutationAmount + dcrg;

        // Update Dashboard
        const displayValue = (val) => (val > 0) ? formatAmount(val) : "0";

        if (totalBenefitsHeader) totalBenefitsHeader.textContent = displayValue(totalLumpSum);
        if (commuteHeader) commuteHeader.textContent = displayValue(commutationAmount);
        if (dcrgHeader) dcrgHeader.textContent = displayValue(dcrg);
        if (balanceHeader) balanceHeader.textContent = displayValue(balancePension);

        // Update Details List
        if (calcLastPay) calcLastPay.textContent = formatAmount(lastPay);
        if (calcQS) calcQS.textContent = years;
        if (calcAvgEmoluments) calcAvgEmoluments.textContent = formatAmount(avgEmoluments);
        if (calcBasicPension) calcBasicPension.textContent = formatAmount(pension);
        if (calcCommutation) calcCommutation.textContent = formatAmount(commutationAmount);
        if (calcReducedPension) calcReducedPension.textContent = formatAmount(balancePension);
        if (calcCommutablePension) calcCommutablePension.textContent = formatAmount(commutablePension);
        if (calcDcrg) calcDcrg.textContent = formatAmount(dcrg);
        if (dispCommFactor) dispCommFactor.textContent = commFactor.toFixed(2);

        // Update Steps with Actual Values
        if (stepDcrg) stepDcrg.textContent = `${formatAmount(lastPay)} × ${dcrgQS / 2}`;
        if (stepCommutation) stepCommutation.textContent = `${formatAmount(commutablePension)} × ${commFactor} × 12`;
        if (stepPension) stepPension.textContent = `(${formatAmount(avgEmoluments)} / 2) × ${pensionFactor.toFixed(2)}`;
        if (stepReduced) stepReduced.textContent = `${formatAmount(pension)} × 60%`;

        // Visibility Condition: Show sections only if Basic Pay and Service Years are valid
        const detailsSection = document.getElementById('details-section');
        const benefitsSection = document.getElementById('benefits-section');
        const reportSettingsSection = document.getElementById('report-settings-section');

        if (detailsSection && benefitsSection && reportSettingsSection) {
            if (bp > 0 && years > 0) {
                detailsSection.classList.remove('hidden');
                benefitsSection.classList.remove('hidden');
                reportSettingsSection.classList.remove('hidden');
            } else {
                detailsSection.classList.add('hidden');
                benefitsSection.classList.add('hidden');
                reportSettingsSection.classList.add('hidden');
            }
        }
    };

    // Function to prepare document for PDF/Print
    const prepareForPDF = () => {
        const nameInput = document.getElementById('reportName');
        const printName = document.getElementById('printEmployeeName');
        const printDate = document.getElementById('printDate');
        const reportTitle = nameInput && nameInput.value ? `DCRG_Report_${nameInput.value.replace(/\s+/g, '_')}` : 'Pension_DCRG_Report';

        if (printName) {
            printName.textContent = nameInput && nameInput.value ? `Employee: ${nameInput.value}` : '';
        }
        if (printDate) {
            printDate.textContent = new Date().toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });
        }

        document.body.classList.add('pdf-mode');
        return reportTitle;
    };

    const cleanupAfterPDF = () => {
        document.body.classList.remove('hide-service', 'hide-details', 'hide-summary', 'pdf-mode');
    };

    // Print / PDF logic
    // Print / PDF logic
    const generatePDFResult = async () => {
        try {
            const jsPDFLib = window.jsPDF || (window.jspdf ? window.jspdf.jsPDF : null);
            if (!jsPDFLib) throw new Error("PDF Library not loaded");
            const doc = new jsPDFLib();
            const reportTitle = prepareForPDF();

            // 1. Header & Branding
            doc.setFillColor(37, 99, 235); // Blue color matches theme
            doc.rect(0, 0, 210, 45, 'F');

            doc.setFontSize(22);
            doc.setTextColor(255);
            doc.setFont("helvetica", "bold");
            doc.text("Pension & DCRG Calculation Report", 14, 20);

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");

            const name = document.getElementById('reportName')?.value;
            const pen = document.getElementById('penNumber')?.value;
            const school = document.getElementById('schoolName')?.value;

            let headerY = 28;
            if (name) { doc.text(`Employee: ${name}`, 14, headerY); headerY += 5; }
            if (pen) { doc.text(`PEN Number: ${pen}`, 14, headerY); headerY += 5; }
            if (school) { doc.text(`School/Office: ${school}`, 14, headerY); headerY += 5; }


            // 2. Section: Service Details
            doc.setFontSize(14);
            doc.setTextColor(40);
            doc.text("1. Service Details", 14, 55);

            const bp = document.getElementById('basicPay').value || "0";
            const da = document.getElementById('daPercentage').value || "0";
            const qs = document.getElementById('serviceYears').value || "0";
            const age = document.getElementById('retirementAge').value || "0";
            const aeIn = document.getElementById('avgEmoluments').value || bp;

            doc.autoTable({
                startY: 60,
                body: [
                    ['Basic Pay (BP)', 'Rs. ' + bp],
                    ['DA Percentage', da + ' %'],
                    ['Retirement Age', age + ' Years'],
                    ['Completed Service', qs + ' Years'],
                    ['Avg 10 Months Basic Pay', 'Rs. ' + aeIn]
                ],
                theme: 'striped',
                columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right' } }
            });

            // 3. Section: Computation Basis
            doc.text("2. Computation Basis", 14, doc.lastAutoTable.finalY + 12);

            const lastPay = document.getElementById('calcLastPay').textContent || "0";
            const aeUsed = document.getElementById('calcAvgEmoluments').textContent || "0";
            const qsUsed = document.getElementById('calcQS').textContent || "0";

            doc.autoTable({
                startY: doc.lastAutoTable.finalY + 17,
                head: [['Component', 'Value', 'Calculation Base']],
                body: [
                    ['Last Basic Pay + DA', 'Rs. ' + lastPay, 'Used for DCRG'],
                    ['Avg 10 Months BP', 'Rs. ' + aeUsed, 'Used for Pension'],
                    ['Qualifying Service', qsUsed + ' Years', 'Max 30/33 Years']
                ],
                theme: 'grid',
                headStyles: { fillColor: [75, 85, 99] },
                columnStyles: { 1: { halign: 'right' } }
            });

            // 4. Section: Monthly Benefits
            doc.text("3. Monthly Benefits", 14, doc.lastAutoTable.finalY + 12);

            const bPension = document.getElementById('calcBasicPension').textContent || "0";
            const rPension = document.getElementById('calcReducedPension').textContent || "0";
            const cPension = document.getElementById('calcCommutablePension').textContent || "0";
            const stepPen = document.getElementById('stepPension').textContent || "";
            const stepRed = document.getElementById('stepReduced').textContent || "";

            doc.autoTable({
                startY: doc.lastAutoTable.finalY + 17,
                head: [['Description', 'Amount', 'Formula / Step']],
                body: [
                    ['Full Basic Pension', 'Rs. ' + bPension, stepPen],
                    ['Reduced Pension (60%)', 'Rs. ' + rPension, stepRed],
                    ['Commutable Pension (40%)', 'Rs. ' + cPension, bPension + ' × 40%']
                ],
                theme: 'grid',
                headStyles: { fillColor: [16, 185, 129] },
                columnStyles: { 1: { halign: 'right' } }
            });

            // 5. Section: Lump Sum Benefits
            doc.text("4. Lump Sum Benefits", 14, doc.lastAutoTable.finalY + 12);

            const commute = document.getElementById('calcCommutation').textContent || "0";
            const dcrgAmt = document.getElementById('calcDcrg').textContent || "0";
            const stepCom = document.getElementById('stepCommutation').textContent || "";
            const stepDcrgVal = document.getElementById('stepDcrg').textContent || "";
            const totalLump = document.getElementById('totalBenefitsHeader').textContent || "0";

            doc.autoTable({
                startY: doc.lastAutoTable.finalY + 17,
                head: [['Description', 'Amount', 'Formula / Step']],
                body: [
                    ['Pension Commutation', 'Rs. ' + commute, stepCom],
                    ['DCRG Amount', 'Rs. ' + dcrgAmt, stepDcrgVal],
                    ['TOTAL LUMP SUM', 'Rs. ' + totalLump, 'Commutation + DCRG']
                ],
                theme: 'grid',
                headStyles: { fillColor: [37, 99, 235] },
                columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } }
            });

            // 6. Footer
            const finalY = doc.lastAutoTable.finalY + 15;
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text("Email: sreee.sreejith@gmail.com", 14, finalY);

            cleanupAfterPDF(); // Cleanup UI changes if any

            // 7. Output Management
            const cap = window.Capacitor;
            const isNative = !!(cap && cap.Plugins && (cap.Plugins.Filesystem || cap.Plugins.Share));

            cleanupAfterPDF();
            // More robust blob creation for mobile
            const pdfOutput = doc.output('arraybuffer');
            const blob = new Blob([pdfOutput], { type: 'application/pdf' });
            return { blob: blob, title: reportTitle };
        } catch (err) {
            cleanupAfterPDF();
            console.error(err);
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
            await window.PDFHelper.share(result.blob, `${result.title}.pdf`, 'Pension & DCRG Report');
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

    const downloadButton = document.getElementById('downloadBtn');
    if (downloadButton) downloadButton.addEventListener('click', downloadPDF);

    const shareButton = document.getElementById('shareBtn');
    if (shareButton) shareButton.addEventListener('click', sharePDF);

    const printBtn = document.getElementById('printBtn');
    if (printBtn) printBtn.style.display = 'none';

    inputs.forEach(input => {
        input.addEventListener('input', () => {
            const source = (input.id === 'avgEmoluments') ? 'ae' : 'other';
            calculateAll(source);
        });
    });

    calculateAll();
});
