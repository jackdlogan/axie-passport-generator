import config from './config.js';

class PassportGenerator {
    constructor() {
        this.canvas = document.getElementById('passportCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.form = document.getElementById('passportForm');
        this.exportBtn = document.getElementById('exportBtn');
        this.shareBtn = document.getElementById('shareBtn');
        this.loadingSpinner = document.querySelector('.loading-spinner');
        this.downloadButtons = document.querySelector('.download-buttons');
        
        // Initialize empty canvas
        this.canvas.width = 800;  // Default width
        this.canvas.height = 600; // Default height
        
        // Preload all templates
        this.templates = {
            Beast: this.loadTemplate('Beast'),
            Aquatic: this.loadTemplate('Aquatic'),
            Plant: this.loadTemplate('Plant'),
            Bird: this.loadTemplate('Bird'),
            Bug: this.loadTemplate('Bug'),
            Reptile: this.loadTemplate('Reptile'),
            Dawn: this.loadTemplate('Dawn'),
            Dusk: this.loadTemplate('Dusk'),
            Mech: this.loadTemplate('Mech')
        };
        
        // Add class images preloading
        this.classImages = {
            Beast: this.loadClassImage('Beast'),
            Aquatic: this.loadClassImage('Aquatic'),
            Plant: this.loadClassImage('Plant'),
            Bird: this.loadClassImage('Bird'),
            Bug: this.loadClassImage('Bug'),
            Reptile: this.loadClassImage('Reptile'),
            Dawn: this.loadClassImage('Dawn'),
            Dusk: this.loadClassImage('Dusk'),
            Mech: this.loadClassImage('Mech')
        };
        
        // Add background images preloading
        this.backgroundImages = {
            Beast: this.loadBackgroundImage('Beast'),
            Aquatic: this.loadBackgroundImage('Aquatic'),
            Plant: this.loadBackgroundImage('Plant'),
            Bird: this.loadBackgroundImage('Bird'),
            Bug: this.loadBackgroundImage('Bug'),
            Reptile: this.loadBackgroundImage('Reptile'),
            Dawn: this.loadBackgroundImage('Dawn'),
            Dusk: this.loadBackgroundImage('Dusk'),
            Mech: this.loadBackgroundImage('Mech')
        };

        this.classTextColors = {
            Plant: '#256434',
            Aquatic: '#005AB5',
            Bird: '#B50064',
            Beast: '#B55A00',
            Bug: '#B50009',
            Reptile: '#5C2677',
            Dusk: '#2D3A74',
            Dawn: '#272771',
            Mech: '#3B3F4F'
        };
        
        // Add font loading promises with specific weights
        this.fontPromises = [
            this.loadCustomFont('Potta One', '400'),
            this.loadCustomFont('Atkinson Hyperlegible', '400'),
            this.loadCustomFont('Atkinson Hyperlegible', 'bold'),
            this.loadCustomFont('Work Sans', '300'),
            this.loadCustomFont('Work Sans', '400'),
            this.loadCustomFont('Work Sans', '500'),
            this.loadCustomFont('Work Sans', '600'),
            this.loadCustomFont('Work Sans', '700')
        ];
        
        this.setupEventListeners();
    }
    loadCustomFont(fontFamily, weight = '400') {
        return new Promise((resolve, reject) => {
            // Create a span with the font to force load
            const span = document.createElement('span');
            span.style.fontFamily = fontFamily;
            span.style.fontWeight = weight;
            span.style.visibility = 'hidden';
            span.textContent = 'Test Font Loading';
            document.body.appendChild(span);

            // Use Font Loading API
            document.fonts.load(`${weight} 1em "${fontFamily}"`).then(() => {
                document.body.removeChild(span);
                console.log(`${fontFamily} (${weight}) font loaded`);
                resolve();
            }).catch(error => {
                document.body.removeChild(span);
                console.error(`Error loading ${fontFamily} (${weight}) font:`, error);
                reject(error);
            });
        });
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.generatePassport();
        });
        
        this.exportBtn.addEventListener('click', () => {
            this.exportPassport();
        });
        
        this.shareBtn.addEventListener('click', () => {
            this.sharePassport();
        });
    }
    
    showLoading() {
        this.canvas.style.display = 'none';
        this.loadingSpinner.style.display = 'flex';
        this.downloadButtons.style.display = 'none';
    }

    hideLoading() {
        this.loadingSpinner.style.display = 'none';
        this.canvas.style.display = 'block';
        this.downloadButtons.style.display = 'flex';
    }

    async generatePassport() {
        this.showLoading();
        
        try {
            // Wait for all fonts to load before proceeding
            await Promise.all(this.fontPromises);
            
            // Additional check for specific fonts
            const fontChecks = await Promise.all([
                document.fonts.load('bold 40px "Potta One"'),
                document.fonts.load('bold 24px "Atkinson Hyperlegible"')
            ]);

            if (!fontChecks.every(check => check.length > 0)) {
                throw new Error('Required fonts not loaded properly');
            }
            
            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Get form data and fetch class first
            const formData = new FormData(this.form);
            const axieId = formData.get('axieId');

            // Fetch Axie class
            const axieClass = await this.getAxieClass(axieId);
            
            // Load the appropriate template
            const template = await this.templates[axieClass];
            
            // Update canvas size based on template size plus padding
            const padding = 360;
            this.canvas.width = template.naturalWidth + padding;
            this.canvas.height = template.naturalHeight + padding;
            
            // Draw the full canvas background first
            const backgroundImage = await this.backgroundImages[axieClass];
            
            // Save context before applying blur
            this.ctx.save();
            
            // Apply blur filter
            this.ctx.filter = 'blur(8px)';
            
            // Draw background image to fill entire canvas
            const scale = Math.max(
                this.canvas.width / backgroundImage.width,
                this.canvas.height / backgroundImage.height
            );
            const x = (this.canvas.width - backgroundImage.width * scale) / 2;
            const y = (this.canvas.height - backgroundImage.height * scale) / 2;
            
            this.ctx.drawImage(
                backgroundImage,
                x, y,
                backgroundImage.width * scale,
                backgroundImage.height * scale
            );
            
            // Restore context to remove blur filter
            this.ctx.restore();
            
            // Draw class-specific template
            this.ctx.drawImage(
                template, 
                padding/2, 
                padding/2, 
                template.naturalWidth, 
                template.naturalHeight
            );
            
            // Adjust all coordinates to account for padding
            const offsetX = padding/2;
            const offsetY = padding/2;
            
            // Draw the border with rounded corners
            this.ctx.strokeStyle = this.classTextColors[axieClass];
            this.ctx.lineWidth = 16;
            
            // Create rounded rectangle path
            this.ctx.beginPath();
            const borderPadding = 2;
            this.ctx.roundRect(
                offsetX + borderPadding,
                offsetY + borderPadding,
                template.naturalWidth - borderPadding * 2,
                template.naturalHeight - borderPadding * 2,
                40
            );
            this.ctx.stroke();
            
            // Load class image
            const classImage = await this.classImages[axieClass];
            
            // Draw class image (adjust position as needed)
            const classImageSize = 54
            const classX = this.canvas.width * 0.12; // 75% from left
            const classY = this.canvas.height * 0.634; // 10% from top
            this.ctx.drawImage(classImage, classX, classY, classImageSize, classImageSize);

            // Add text to passport
            this.ctx.font = 'bold 40px "Potta One"';
            this.ctx.fillStyle = '#6D4218';
            
            // Adjust text positioning based on template dimensions
            const textX = this.canvas.width * 0.415;  // 40% from left
            const startY = this.canvas.height * 0.625;  // 55% from top
            const lineHeight = this.canvas.height * 0.054;  // 8% of height
            const date = new Date().toLocaleDateString();
            
            this.ctx.fillText(formData.get('owner'), textX, startY);
            this.ctx.fillText(formData.get('location'), textX, startY + lineHeight);
            this.ctx.fillText(new Date(formData.get('dob')).toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit', 
                year: 'numeric'
            }), textX, startY + lineHeight * 2);
            this.ctx.fillText(formData.get('axieId'), textX + textX*0.56, startY + lineHeight *2 );
            this.ctx.fillText(new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit', 
                year: 'numeric'
            }), textX, startY + lineHeight * 3);
            const holdingPeriods = ["Never", "Until I sell", "I don't know", "It stop being cute", "Eternity" , "When I need to pay rent"];
            const randomPhrase = holdingPeriods[Math.floor(Math.random() * holdingPeriods.length)];
            this.ctx.fillText(randomPhrase, textX + textX*0.56, startY + lineHeight *3 );

            // Second text style
            this.ctx.font = 'bold 24px "Atkinson Hyperlegible"';
            this.ctx.letterSpacing = '6px';
            this.ctx.fillStyle = this.classTextColors[axieClass];
            const ownerText = formData.get('owner').toUpperCase();
            const line1 = `LUNACIAN<<< ${ownerText} `.padEnd(67, '<');
            const line2 = `AXIE<INFINITY<<<<< ${axieId} `.padEnd(67, '<');
            this.ctx.fillText(line1, 240, startY*1.4);
            this.ctx.fillText(line2, 240, startY*1.425);

            // Handle Axie image and background
            const axieImage = await this.loadAxieImage(axieId);
            
            // Position profile picture relative to canvas size
            const maxSize = this.canvas.height * 0.31;
            const picX = this.canvas.width * 0.084;
            const picY = this.canvas.height * 0.548;
            
            // Calculate dimensions for 5:6 ratio background
            const bgWidth = maxSize * 0.55;  // 70% of maxSize as before
            const bgHeight = (bgWidth * 6) / 5;  // maintain 5:6 ratio
            
            // Center the background in the available space
            const bgX = picX + (maxSize - bgWidth) / 2;
            const bgY = picY + (maxSize - bgHeight) / 2;
            
            // Calculate aspect ratio for Axie image
            const aspectRatio = axieImage.width / axieImage.height;
            let picWidth, picHeight;
            
            if (aspectRatio > 1) {
                picWidth = maxSize*0.9;
                picHeight = maxSize*0.9 / aspectRatio;
            } else {
                picHeight = maxSize;
                picWidth = maxSize * aspectRatio;
            }
            
            // Center the Axie image in the allocated space
            const xOffset = (maxSize - picWidth) / 2;
            const yOffset = (maxSize - picHeight) / 2;
            
            // Save the current canvas state
            this.ctx.save();
            
            // Create a rounded clipping path for the container
            this.ctx.beginPath();
            const radius = 20;
            this.ctx.roundRect(picX, picY, maxSize, maxSize, radius);
            this.ctx.clip();
            
            // Create another clipping path for the background
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.roundRect(bgX, bgY, bgWidth, bgHeight, 40);
            this.ctx.clip();
            
            // Draw the background
            this.ctx.drawImage(backgroundImage, bgX, bgY, bgWidth, bgHeight);
            
            // Restore to the first clip state
            this.ctx.restore();
            
            // Then draw the Axie image centered on top
            // Save context to restore after flip
            this.ctx.save();
            // Translate to the center of where we want to draw the image
            this.ctx.translate(picX + xOffset + picWidth/2, picY + yOffset + picHeight/2);
            // Flip horizontally
            this.ctx.scale(-1, 1);
            // Draw image centered at origin (need to offset back by half dimensions)
            this.ctx.drawImage(axieImage, 
                -picWidth/2, -picHeight/2, 
                picWidth, picHeight);
            // Restore context
            this.ctx.restore();
            // Restore the canvas state
            this.ctx.restore();

            // After all drawing is complete
            this.hideLoading();
        } catch (error) {
            console.error('Error generating passport:', error);
            alert('Failed to generate passport. Please check the Axie ID.');
            this.hideLoading();
            return;
        }
    }
    
    loadAxieImage(axieId) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';  // Enable CORS
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load Axie image'));
            img.src = `https://axiecdn.axieinfinity.com/axies/${axieId}/axie/axie-full-transparent.png`;
        });
    }
    
    async exportPassport() {
        try {
            // Get the axie ID and class for filename
            const axieId = this.form.axieId.value;
            const axieClass = await this.getAxieClass(axieId);
            
            // Create filename with axie ID and class
            const filename = `axie-${axieId}-${axieClass.toLowerCase()}-passport.png`;
            
            // Convert the canvas to a blob
            const blob = await new Promise(resolve => {
                this.canvas.toBlob(resolve, 'image/png', 1.0);
            });
            
            // Create object URL
            const url = URL.createObjectURL(blob);
            
            // Create temporary link and trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting passport:', error);
            alert('Failed to export passport. Please try again.');
        }
    }
    
    async sharePassport() {
        try {
            // Get the axie ID and class for the tweet
            const axieId = this.form.axieId.value;
            const axieClass = await this.getAxieClass(axieId);
            
            // Convert canvas to blob
            const blob = await new Promise(resolve => {
                this.canvas.toBlob(resolve, 'image/png', 1.0);
            });
            
            // Create a temporary URL for the image
            const imageUrl = URL.createObjectURL(blob);
            
            // Compose tweet text
            const tweetText = "Share your passport to celebrate Atia's Legacy #axieinfinity #atiaslegacy";
            
            // Open Twitter share dialog in a new window
            const width = 550;
            const height = 420;
            const left = (window.screen.width - width) / 2;
            const top = (window.screen.height - height) / 2;
            
            // Create Twitter intent URL
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
            
            window.open(
                twitterUrl,
                'Share on Twitter',
                `width=${width},height=${height},left=${left},top=${top}`
            );
            
            // Clean up
            URL.revokeObjectURL(imageUrl);
        } catch (error) {
            console.error('Error sharing to Twitter:', error);
            alert('Failed to share to Twitter. Please try again.');
        }
    }

    loadClassImage(className) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = `./assets/Class/${className}.png`;
        });
    }

    loadBackgroundImage(className) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = `./assets/Background/${className}.png`;
        });
    }

    async getAxieClass(axieId) {
        const query = `
            query GetAxieClass {
                axie(axieId: "${axieId}") {
                    class
                }
            }
        `;

        try {
            const response = await fetch('https://api-gateway.skymavis.com/graphql/axie-marketplace', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "x-api-key": config.API_KEY
                },
                body: JSON.stringify({ query })
            });

            const data = await response.json();
            if (data.data?.axie?.class) {
                console.log(data.data.axie.class)
                return data.data.axie.class;
            }
            throw new Error('Could not fetch Axie class');
        } catch (error) {
            console.error('Error fetching Axie class:', error);
            throw error;
        }
    }

    loadTemplate(className) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = `./assets/Template/${className}.png`;
        });
    }
}

// Initialize the passport generator when the page loads
window.addEventListener('load', () => {
    new PassportGenerator();
}); 