class HalfWaveRectifierSimulation {
    constructor() {
        this.canvas = document.getElementById('waveformCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isRunning = false;
        this.animationId = null;
        
        this.initializeControls();
        this.drawCircuit();
        this.updateMeasurements();
    }

    initializeControls() {
        // Circuit type toggle
        document.getElementById('circuitType').addEventListener('change', (e) => {
            const capacitorControl = document.getElementById('capacitorControl');
            capacitorControl.style.display = e.target.value === 'with' ? 'block' : 'none';
            this.drawCircuit();
            this.updateMeasurements();
        });

        // Input voltage control
        document.getElementById('inputVoltage').addEventListener('input', (e) => {
            document.getElementById('voltageValue').textContent = e.target.value + ' V';
            this.updateMeasurements();
        });

        // Frequency control
        document.getElementById('frequency').addEventListener('input', (e) => {
            document.getElementById('frequencyValue').textContent = e.target.value + ' Hz';
        });

        // Load resistance control
        document.getElementById('loadResistance').addEventListener('input', (e) => {
            document.getElementById('resistanceValue').textContent = e.target.value + ' Ω';
            this.updateMeasurements();
        });

        // Capacitance control
        document.getElementById('capacitance').addEventListener('input', (e) => {
            document.getElementById('capacitanceValue').textContent = e.target.value + ' μF';
            this.updateMeasurements();
        });

        // Start simulation button
        document.getElementById('startSimulation').addEventListener('click', () => {
            this.startSimulation();
        });

        // Reset simulation button
        document.getElementById('resetSimulation').addEventListener('click', () => {
            this.resetSimulation();
        });

        // Quiz submission
        document.getElementById('submitQuiz').addEventListener('click', () => {
            this.checkQuizAnswer();
        });
    }

    getSimulationParameters() {
        const circuitType = document.getElementById('circuitType').value;
        const inputVoltage = parseFloat(document.getElementById('inputVoltage').value);
        const frequency = parseFloat(document.getElementById('frequency').value);
        const loadResistance = parseFloat(document.getElementById('loadResistance').value);
        const capacitance = circuitType === 'with' ? 
            parseFloat(document.getElementById('capacitance').value) : 0;

        return {
            circuitType,
            inputVoltage,
            frequency,
            loadResistance,
            capacitance
        };
    }

    calculateOutput(params) {
        const Vrms = params.inputVoltage;
        const Vm = Vrms * Math.sqrt(2); // Peak voltage
        const Vd = 0.6; // Diode forward voltage drop
        
        let Vdc, rippleFactor, efficiency;

        if (params.circuitType === 'without') {
            // Without filter calculations
            Vdc = (Vm - Vd) / Math.PI;
            rippleFactor = 1.21;
            efficiency = 40.6; // Theoretical efficiency for half-wave rectifier
        } else {
            // With filter calculations (simplified)
            Vdc = Vm - Vd - 0.5; // Approximate accounting for ripple
            rippleFactor = 0.48; // Reduced ripple with filter
            efficiency = 40.6; // Same theoretical efficiency
        }

        return {
            inputPeak: Vm,
            outputDc: Vdc,
            rippleFactor: rippleFactor,
            efficiency: efficiency
        };
    }

    updateMeasurements() {
        const params = this.getSimulationParameters();
        const results = this.calculateOutput(params);

        document.getElementById('inputRms').textContent = params.inputVoltage.toFixed(2) + ' V';
        document.getElementById('inputPeak').textContent = results.inputPeak.toFixed(2) + ' V';
        document.getElementById('outputDc').textContent = results.outputDc.toFixed(2) + ' V';
        document.getElementById('rippleFactor').textContent = results.rippleFactor.toFixed(2);
        document.getElementById('efficiency').textContent = results.efficiency.toFixed(1) + '%';
    }

    drawCircuit() {
        const circuitSvg = document.getElementById('circuitSvg');
        const circuitType = document.getElementById('circuitType').value;
        
        // Simple ASCII circuit diagram - in a real implementation, you might use SVG
        if (circuitType === 'without') {
            circuitSvg.innerHTML = `
                <div style="font-family: monospace; font-size: 14px; line-height: 1.5;">
                    AC Source ~<br>
                    │<br>
                    │ 6V RMS<br>
                    │<br>
                    ┌─┐<br>
                    │ │ Transformer<br>
                    └─┘<br>
                    │<br>
                    ┌─┐<br>
                    │▷│ Diode (IN4001)<br>
                    └─┘<br>
                    │<br>
                    ┌─┐<br>
                    │ │ R = 1kΩ<br>
                    └─┘<br>
                    │<br>
                    ─── Ground
                </div>
            `;
        } else {
            circuitSvg.innerHTML = `
                <div style="font-family: monospace; font-size: 14px; line-height: 1.5;">
                    AC Source ~<br>
                    │<br>
                    │ 6V RMS<br>
                    │<br>
                    ┌─┐<br>
                    │ │ Transformer<br>
                    └─┘<br>
                    │<br>
                    ┌─┐<br>
                    │▷│ Diode (IN4001)<br>
                    └─┘<br>
                    │<br>
                    ┌─┐<br>
                    │ │ R = 1kΩ<br>
                    └─┘<br>
                    │<br>
                    ┌─┐ C = 100μF<br>
                    │ │<br>
                    └─┘<br>
                    │<br>
                    ─── Ground
                </div>
            `;
        }
    }

    startSimulation() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        document.getElementById('startSimulation').disabled = true;
        this.animateWaveforms();
    }

    resetSimulation() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        document.getElementById('startSimulation').disabled = false;
        this.drawWaveforms(0);
    }

    animateWaveforms() {
        let startTime = Date.now();
        
        const animate = () => {
            if (!this.isRunning) return;
            
            const currentTime = Date.now() - startTime;
            this.drawWaveforms(currentTime);
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate();
    }

    drawWaveforms(currentTime) {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const params = this.getSimulationParameters();
        
        // Clear canvas
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        // Draw grid
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        
        // Vertical grid lines
        for (let x = 0; x < width; x += width / 10) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        // Horizontal grid lines
        for (let y = 0; y < height; y += height / 6) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Draw axes
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(50, height / 2);
        ctx.lineTo(width - 50, height / 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(50, 20);
        ctx.lineTo(50, height - 20);
        ctx.stroke();
        
        // Draw labels
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.fillText('Time', width - 40, height / 2 + 20);
        ctx.fillText('Voltage (V)', 10, 15);
        
        // Calculate waveform parameters
        const Vm = params.inputVoltage * Math.sqrt(2);
        const period = 1000 / params.frequency; // Period in milliseconds
        const timeScale = width / (2 * period);
        
        // Draw input waveform (sine wave)
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let x = 0; x < width; x++) {
            const t = (x / timeScale) % period;
            const inputY = height / 2 - (Math.sin(2 * Math.PI * t / period) * Vm * 10);
            
            if (x === 0) {
                ctx.moveTo(x + 50, inputY);
            } else {
                ctx.lineTo(x + 50, inputY);
            }
        }
        ctx.stroke();
        
        // Draw output waveform (half-wave rectified)
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let x = 0; x < width; x++) {
            const t = (x / timeScale + currentTime / 20) % period;
            let outputY;
            
            if (Math.sin(2 * Math.PI * t / period) > 0) {
                // Positive half cycle
                outputY = height / 2 - (Math.sin(2 * Math.PI * t / period) * (Vm - 0.6) * 10);
                
                if (params.circuitType === 'with') {
                    // Add capacitor smoothing effect
                    outputY = height / 2 - ((Vm - 0.6) * 10 - 2 * Math.random());
                }
            } else {
                // Negative half cycle - blocked by diode
                outputY = height / 2;
                
                if (params.circuitType === 'with') {
                    // Capacitor discharge during negative half cycle
                    outputY = height / 2 - ((Vm - 0.6) * 10 * Math.exp(-t / (params.capacitance * params.loadResistance / 1000000)));
                }
            }
            
            if (x === 0) {
                ctx.moveTo(x + 50, outputY);
            } else {
                ctx.lineTo(x + 50, outputY);
            }
        }
        ctx.stroke();
        
        // Draw legend
        ctx.fillStyle = '#3498db';
        ctx.fillRect(width - 150, 20, 20, 10);
        ctx.fillStyle = '#000';
        ctx.fillText('Input AC', width - 120, 30);
        
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(width - 150, 40, 20, 10);
        ctx.fillStyle = '#000';
        ctx.fillText('Output DC', width - 120, 50);
    }

    checkQuizAnswer() {
        const selectedAnswer = document.querySelector('input[name="q1"]:checked');
        const resultDiv = document.getElementById('quizResult');
        
        if (!selectedAnswer) {
            resultDiv.innerHTML = '<p style="color: red;">Please select an answer!</p>';
            return;
        }
        
        if (selectedAnswer.value === 'b') {
            resultDiv.innerHTML = '<p style="color: green;">Correct! A rectifier converts AC to DC.</p>';
        } else {
            resultDiv.innerHTML = '<p style="color: red;">Incorrect. The correct answer is: Convert AC to DC</p>';
        }
    }
}

// Initialize the simulation when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new HalfWaveRectifierSimulation();
});
