window.PDFHelper = {
    /**
     * Share a PDF blob using Capacitor or Web Share API
     */
    share: async function (blob, fileName, title) {
        console.log('PDFHelper.share initiation', { fileName });
        const cap = window.Capacitor;
        const isNative = !!(cap && (cap.isNative || (cap.Plugins && cap.Plugins.Filesystem)));

        if (!fileName.toLowerCase().endsWith('.pdf')) {
            fileName += '.pdf';
        }
        const safeFileName = fileName.replace(/[^a-z0-9.]/gi, '_');

        try {
            if (isNative && cap.Plugins && cap.Plugins.Filesystem && cap.Plugins.Share) {
                console.log('Native sharing detected');

                // 1. Convert Blob to Base64
                const base64Data = await this._blobToBase64(blob);

                // 2. Save to Temporary Directory
                const fileResult = await cap.Plugins.Filesystem.writeFile({
                    path: safeFileName,
                    data: base64Data,
                    directory: 'CACHE'
                });

                // 3. Share
                await cap.Plugins.Share.share({
                    title: title || 'Report',
                    text: 'View my calculation report',
                    files: [fileResult.uri]
                });

                return { success: true, method: 'native-share' };
            } else if (navigator.share) {
                console.log('Web Share API detected');
                const file = new File([blob], safeFileName, { type: 'application/pdf' });

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: title || 'Report'
                    });
                    return { success: true, method: 'web-share' };
                } else {
                    return await this.download(blob, safeFileName);
                }
            } else {
                return await this.download(blob, safeFileName);
            }
        } catch (err) {
            console.error("PDFHelper Share Error:", err);
            if (err.name !== 'AbortError') {
                return await this.download(blob, safeFileName);
            }
            throw err;
        }
    },

    /**
     * Download/Save a PDF blob
     */
    download: async function (blob, fileName) {
        console.log('PDFHelper.download initiation', { fileName });
        const cap = window.Capacitor;
        const isNative = !!(cap && (cap.isNative || (cap.Plugins && cap.Plugins.Filesystem)));

        if (!fileName.toLowerCase().endsWith('.pdf')) {
            fileName += '.pdf';
        }
        const safeFileName = fileName.replace(/[^a-z0-9.]/gi, '_');

        try {
            if (isNative && cap.Plugins && cap.Plugins.Filesystem) {
                const base64Data = await this._blobToBase64(blob);

                const fileResult = await cap.Plugins.Filesystem.writeFile({
                    path: safeFileName,
                    data: base64Data,
                    directory: 'DOCUMENTS',
                    recursive: true
                });

                alert("✅ Report saved to Documents!\n\nFile: " + safeFileName);
                return { success: true, method: 'native-save', uri: fileResult.uri };
            } else {
                console.log('Standard browser download initiated');
                const url = URL.createObjectURL(blob);

                // For mobile browsers, window.open can sometimes be more reliable than anchor.click()
                const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

                if (isMobile) {
                    window.open(url, '_blank');
                } else {
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = safeFileName;
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();
                    setTimeout(() => {
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                    }, 2000);
                }

                return { success: true, method: isMobile ? 'mobile-open' : 'browser-download' };
            }
        } catch (err) {
            console.error("PDFHelper Download Error:", err);
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            throw err;
        }
    },

    /**
     * Internal: Convert Blob to Base64
     */
    _blobToBase64: function (blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result;
                const base64 = typeof result === 'string' ? result.split(',')[1] : '';
                resolve(base64);
            };
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(blob);
        });
    }
};
