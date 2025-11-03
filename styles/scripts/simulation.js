class HalfWaveRectifierSimulation {
    constructor() {
        this.isSimulating = false;
        this.animationId = null;
        this.time = 0;
        
        this.circuitSvg = document.getElementById('circuitSvg');
        this.inputCanvas = document.getElementById('inputWaveform');
        this.outputCanvas = document.getElementById('outputWaveform');
        this.inputCtx = this.inputCanvas.getContext('2d');
        this.outputCtx = this.outputCanvas.getContext('2d');
        
        this.initializeControls();
        this.drawCircuit('without');
        this.updateMeasurements();
    }

    initializeControls() {
        // Circuit type change
        document.getElementById('circuitType').addEventListener('change', (e) => {
            this.drawCircuit(e.target.value);
            this.updateMeasurements();
        });

        // Input voltage control
        document.getElementById('inputVoltage').addEventListener('input', (e) => {
            document.getElementById('voltageValue').textContent = e.target.value + 'V RMS';
            this.updateMeasurements();
        });

        // Load resistance control
        document.getElementById('loadResistance').addEventListener('input', (e) => {
            document.getElementById('resistanceValue').textContent = e.target.value + 'Ω';
            this.updateMeasurements();
        });

        // Capacitance control
        document.getElementById('capacitance').addEventListener('input', (e) => {
            document.getElementById('capacitanceValue').textContent = e.target.value + 'μF';
            this.updateMeasurements();
        });

        // Simulation controls
        document.getElementById('startSimulation').addEventListener('click', () => {
            this.startSimulation();
        });

        document.getElementById('stopSimulation').addEventListener('click', () => {
            this.stopSimulation();
        });

        // Quiz
        document.getElementById('submitQuiz').addEventListener('click', () => {
            this.checkQuiz();
        });
    }

    getSimulationParameters() {
        const circuitType = document.getElementById('circuitType').value;
        const inputVoltage = parseFloat(document.getElementById('inputVoltage').value);
        const loadResistance = parseFloat(document.getElementById('loadResistance').value);
        const capacitance = parseFloat(document.getElementById('capacitance').value);

        return { circuitType, inputVoltage, loadResistance, capacitance };
    }

    drawCircuit(type) {
        this.circuitSvg.innerHTML = '';
        
        if (type === 'without') {
            this.drawCircuitWithoutFilter();
        } else {
            this.drawCircuitWithFilter();
        }
    }

    drawCircuitWithoutFilter() {
        const ns = "http://www.w3.org/2000/svg";
        
        // AC Source
        const acSource = document.createElementNS(ns, "g");
        acSource.innerHTML = `
            <circle cx="100" cy="150" r="25" fill="white" stroke="#3498db" stroke-width="3"/>
            <path d="M80,150 Q90,130 100,150 Q110,170 120,150" stroke="#3498db" stroke-width="3" fill="none"/>
            <text x="100" y="190" text-anchor="middle" fill="#2c3e50">6V AC</text>
        `;
        this.circuitSvg.appendChild(acSource);

        // Diode
        const diode = document.createElementNS(ns, "g");
        diode.setAttribute('class', 'diode');
        diode.innerHTML = `
            <polygon points="200,135 230,150 200,165" fill="#ecf0f1" stroke="#e74c3c" stroke-width="3"/>
            <line x1="200" y1="135" x2="200" y2="165" stroke="#e74c3c" stroke-width="3"/>
            <text x="215" y="190" text-anchor="middle" fill="#2c3e50">Diode</text>
        `;
        this.circuitSvg.appendChild(diode);

        // Resistor
        const resistor = document.createElementNS(ns, "rect");
        resistor.setAttribute('x', '300');
        resistor.setAttribute('y', '135');
        resistor.setAttribute('width', '40');
        resistor.setAttribute('height', '30');
        resistor.setAttribute('fill', '#f39c12');
        resistor.setAttribute('stroke', '#2c3e50');
        resistor.setAttribute('stroke-width', '2');
        resistor.setAttribute('rx', '5');
        this.circuitSvg.appendChild(resistor);

        const resistorText = document.createElementNS(ns, "text");
        resistorText.setAttribute('x', '320');
        resistorText.setAttribute('y', '190');
        resistorText.setAttribute('text-anchor', 'middle');
        resistorText.textContent = '1kΩ';
        this.circuitSvg.appendChild(resistorText);

        // Ground
        const ground = document.createElementNS(ns, "g");
        ground.innerHTML = `
            <line x1="400" y1="150" x2="420" y2="150" stroke="#2c3e50" stroke-width="3"/>
            <line x1="405" y1="155" x2="415" y2="155" stroke="#2c3e50" stroke-width="3"/>
            <line x1="408" y1="160" x2="412" y2="160" stroke="#2c3e50" stroke-width="3"/>
            <text x="410" y="190" text-anchor="middle" fill="#2c3e50">Ground</text>
        `;
        this.circuitSvg.appendChild(ground);

        // Wires
        this.drawWire(125, 150, 175, 150); // AC to Diode
        this.drawWire(235, 150, 295, 150); // Diode to Resistor
        this.drawWire(345, 150, 395, 150); // Resistor to Ground
    }

    drawCircuitWithFilter() {
        const ns = "http://www.w3.org/2000/svg";
        
        // AC Source
        const acSource = document.createElementNS(ns, "g");
        acSource.innerHTML = `
            <circle cx="100" cy="150" r="25" fill="white" stroke="#3498db" stroke-width="3"/>
            <path d="M80,150 Q90,130 100,150 Q110,170 120,150" stroke="#3498db" stroke-width="3" fill="none"/>
            <text x="100" y="190" text-anchor="middle" fill="#2c3e50">6V AC</text>
        `;
        this.circuitSvg.appendChild(acSource);

        // Diode
        const diode = document.createElementNS(ns, "g");
        diode.setAttribute('class', 'diode');
        diode.innerHTML = `
            <polygon points="200,135 230,150 200,165" fill="#ecf0f1" stroke="#e74c3c" stroke-width="3"/>
            <line x1="200" y1="135" x2="200" y2="165" stroke="#e74c3c" stroke-width="3"/>
            <text x="215" y="190" text-anchor="middle" fill="#2c3e50">Diode</text>
        `;
        this.circuitSvg.appendChild(diode);

        // Capacitor
        const capacitor = document.createElementNS(ns, "g");
        capacitor.setAttribute('class', 'capacitor');
        capacitor.innerHTML = `
            <line x1="280" y1="120" x2="280" y2="180" stroke="#9b59b6" stroke-width="3"/>
            <line x1="300" y1="120" x2="300" y2="180" stroke="#9b59b6" stroke-width="3"/>
            <text x="290" y="100" text-anchor="middle" fill="#2c3e50">100μF</text>
        `;
        this.circuitSvg.appendChild(capacitor);

        // Resistor
        const resistor = document.createElementNS(ns, "rect");
        resistor.setAttribute('x', '350');
        resistor.setAttribute('y', '135');
        resistor.setAttribute('width', '40');
        resistor.setAttribute('height', '30');
        resistor.setAttribute('fill', '#f39c12');
        resistor.setAttribute('stroke', '#2c3e50');
        resistor.setAttribute('stroke-width', '2');
        resistor.setAttribute('rx', '5');
        this.circuitSvg.appendChild(resistor);

        const resistorText = document.createElementNS(ns, "text");
        resistorText.setAttribute('x', '370');
        resistorText.setAttribute('y', '190');
        resistorText.setAttribute('text-anchor', 'middle');
        resistorText.textContent = '1kΩ';
        this.circuitSvg.appendChild(resistorText);

        // Ground
        const ground = document.createElementNS(ns, "g");
        ground.innerHTML = `
            <line x1="450" y1="150" x2="470" y2="150" stroke="#2c3e50" stroke-width="3"/>
            <line x1="455" y1="155" x2="465" y2="155" stroke="#2c3e50" stroke-width="3"/>
            <line x1="458" y1="160" x2="462" y2="160" stroke="#2c3e50" stroke-width="3"/>
            <text x="460" y="190" text-anchor="middle" fill="#2c3e50">Ground</text>
        `;
        this.circuitSvg.appendChild(ground);

        // Wires
        this.drawWire(125, 150, 175, 150); // AC to Diode
        this.drawWire(235, 150, 275, 150); // Diode to Capacitor
        this.drawWire(305, 150, 345, 150); // Capacitor to Resistor
        this.drawWire(395, 150, 445, 150); // Resistor to Ground
        this.drawWire(290, 150, 290, 120); // Capacitor top connection
        this.drawWire(290, 120, 470, 120); // Top rail
        this.drawWire(470, 120, 470, 150); // Top to ground
    }

    drawWire(x1, y1, x2, y2) {
        const ns = "http://www.w3.org/2000/svg";
        const wire = document.createElementNS(ns, "line");
        wire.setAttribute('x1', x1);
        wire.setAttribute('y1', y1);
        wire.setAttribute('x2', x2);
        wire.setAttribute('y2', y2);
        wire.setAttribute('stroke', '#2c3e50');
        wire.setAttribute('stroke-width', '3');
        this.circuitSvg.appendChild(wire);
    }

    startSimulation() {
        if (this.isSimulating) return;
        
        this.isSimulating = true;
        this.time = 0;
        this.simulate();
        
        // Add visual feedback
        document.querySelector('.circuit-display').classList.add('simulating');
    }

    stopSimulation() {
        this.isSimulating = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        document.querySelector('.circuit-display').classList.remove('simulating');
        this.clearWaveforms();
    }

    simulate() {
        if (!this.isSimulating) return;

        const params = this.getSimulationParameters();
        this.time += 0.05;

        // Update circuit animation
        this.animateCircuit(params.circuitType);

        // Draw waveforms
        this.drawInputWaveform(params);
        this.drawOutputWaveform(params);

        // Update measurements
        this.updateLiveMeasurements(params);

        this.animationId = requestAnimationFrame(() => this.simulate());
    }

    animateCircuit(circuitType) {
        const diode = this.circuitSvg.querySelector('.diode');
        const capacitor = this.circuitSvg.querySelector('.capacitor');
        
        // Animate diode conduction
        const inputVoltage = Math.sin(this.time);
        if (inputVoltage > 0.1) {
            diode.classList.add('conducting');
        } else {
            diode.classList.remove('conducting');
        }

        // Animate capacitor charging
        if (capacitor && circuitType === 'with') {
            if (inputVoltage > 0.1) {
                capacitor.classList.add('charging');
            } else {
                capacitor.classList.remove('charging');
            }
        }
    }

    drawInputWaveform(params) {
        const ctx = this.inputCtx;
        const width = this.inputCanvas.width;
        const height = this.inputCanvas.height;
        
        // Clear canvas
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, width, height);
        
        // Draw grid
        this.drawGrid(ctx, width, height);
        
        // Draw input sine wave
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        const amplitude = height / 3;
        const frequency = 0.02;
        
        for (let x = 0; x < width; x++) {
            const y = height / 2 + Math.sin(this.time + x * frequency) * amplitude;
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }

    drawOutputWaveform(params) {
        const ctx = this.outputCtx;
        const width = this.outputCanvas.width;
        const height = this.outputCanvas.height;
        
        // Clear canvas
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, width, height);
        
        // Draw grid
        this.drawGrid(ctx, width, height);
        
        // Draw output waveform
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        const amplitude = height / 3;
        const frequency = 0.02;
        const hasFilter = params.circuitType === 'with';
        
        for (let x = 0; x < width; x++) {
            const input = Math.sin(this.time + x * frequency);
            let output;
            
            if (hasFilter) {
                // With filter - smoothed output
                if (input > 0) {
                    output = input * 0.9 + 0.1; // DC offset with ripple
                } else {
                    output = Math.max(0.1, 0.1 + input * 0.1); // Capacitor discharge
                }
            } else {
                // Without filter - half wave
                output = Math.max(0, input);
            }
            
            const y = height / 2 - output * amplitude;
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        
        // Draw waveform type label
        ctx.fillStyle = '#e74c3c';
        ctx.font = '14px Arial';
        ctx.fillText(hasFilter ? 'With Capacitor Filter' : 'Without Filter', 10, 20);
    }

    drawGrid(ctx, width, height) {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x <= width; x += width / 10) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= height; y += height / 4) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Center line
        ctx.strokeStyle = '#555';
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
    }

    clearWaveforms() {
        this.inputCtx.clearRect(0, 0, this.inputCanvas.width, this.inputCanvas.height);
        this.outputCtx.clearRect(0, 0, this.outputCanvas.width, this.outputCanvas.height);
    }

    updateMeasurements() {
        const params = this.getSimulationParameters();
        const Vrms = params.inputVoltage;
        const Vm = Vrms * Math.sqrt(2);
        const Vd = 0.7; // Diode voltage drop
        
        let Vdc, rippleVoltage, rippleFactor, efficiency;
        
        if (params.circuitType === 'without') {
            Vdc = (Vm - Vd) / Math.PI;
            rippleVoltage = Vm - Vd;
            rippleFactor = 1.21;
            efficiency = 40.6;
        } else {
            Vdc = Vm - Vd - 0.5;
            rippleVoltage = 0.5;
            rippleFactor = 0.48;
            efficiency = 40.6;
        }
        
        document.getElementById('inputRMS').textContent = Vrms.toFixed(2) + ' V';
        document.getElementById('inputPeak').textContent = Vm.toFixed(2) + ' V';
        document.getElementById('outputDC').textContent = Vdc.toFixed(2) + ' V';
        document.getElementById('rippleVoltage').textContent = rippleVoltage.toFixed(2) + ' V';
        document.getElementById('rippleFactor').textContent = rippleFactor.toFixed(2);
        document.getElementById('efficiency').textContent = efficiency.toFixed(1) + '%';
    }

    updateLiveMeasurements(params) {
        const Vrms = params.inputVoltage;
        const Vm = Vrms * Math.sqrt(2);
        const timeVarying = Math.abs(Math.sin(this.time));
        
        // Add some realistic variation to measurements during simulation
        const variation = 0.1 * Math.sin(this.time * 2);
        
        let Vdc, rippleVoltage;
        
        if (params.circuitType === 'without') {
            Vdc = (Vm - 0.7) / Math.PI * (1 + variation * 0.1);
            rippleVoltage = (Vm - 0.7) * timeVarying;
        } else {
            Vdc = (Vm - 0.7 - 0.3) * (1 + variation * 0.05);
            rippleVoltage = 0.3 * timeVarying;
        }
        
        document.getElementById('outputDC').textContent = Vdc.toFixed(2) + ' V';
        document.getElementById('rippleVoltage').textContent = rippleVoltage.toFixed(2) + ' V';
    }

    checkQuiz() {
        const selected = document.querySelector('input[name="q1"]:checked');
        const result = document.getElementById('quizResult');
        
        if (!selected) {
            result.innerHTML = '<span style="color: #e74c3c;">Please select an answer!</span>';
            return;
        }
        
        if (selected.value === 'b') {
            result.innerHTML = '<span style="color: #27ae60;">✓ Correct! A diode allows current to flow in only one direction.</span>';
        } else {
            result.innerHTML = '<span style="color: #e74c3c;">✗ Incorrect. The correct answer is: Allow current in one direction only</span>';
        }
    }
}

// Initialize simulation when page loads
document.addEventListener('DOMContentLoaded', () => {
    new HalfWaveRectifierSimulation();
});
