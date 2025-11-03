class CircuitBuilder {
    constructor() {
        this.canvas = document.getElementById('circuitCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.components = [];
        this.wires = [];
        this.selectedComponent = null;
        this.dragging = false;
        this.dragOffset = { x: 0, y: 0 };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupComponentDrag();
        this.drawGrid();
    }

    setupEventListeners() {
        // Quick build buttons
        document.getElementById('buildHalfWave').addEventListener('click', () => {
            this.buildHalfWaveRectifier();
        });

        document.getElementById('buildWithFilter').addEventListener('click', () => {
            this.buildHalfWaveWithFilter();
        });

        document.getElementById('clearCircuit').addEventListener('click', () => {
            this.clearCircuit();
        });

        // Simulation controls
        document.getElementById('simulateBtn').addEventListener('click', () => {
            this.startSimulation();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetSimulation();
        });

        document.getElementById('analyzeBtn').addEventListener('click', () => {
            this.analyzeCircuit();
        });
    }

    setupComponentDrag() {
        const componentItems = document.querySelectorAll('.component-item');
        
        componentItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.dataset.type);
            });
        });

        this.canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        this.canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            const componentType = e.dataTransfer.getData('text/plain');
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.addComponent(componentType, x, y);
        });

        // Canvas click for selection
        this.canvas.addEventListener('mousedown', (e) => {
            this.handleCanvasClick(e);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            this.handleCanvasMouseMove(e);
        });

        this.canvas.addEventListener('mouseup', () => {
            this.dragging = false;
        });
    }

    addComponent(type, x, y) {
        const component = {
            id: Date.now() + Math.random(),
            type: type,
            x: Math.round(x / 20) * 20, // Snap to grid
            y: Math.round(y / 20) * 20,
            properties: this.getDefaultProperties(type),
            connections: []
        };

        this.components.push(component);
        this.drawCircuit();
        this.updatePropertiesPanel(component);
    }

    getDefaultProperties(type) {
        const properties = {
            'ac-source': { voltage: 6, frequency: 50, phase: 0 },
            'diode': { type: 'IN4001', forwardVoltage: 0.7, maxCurrent: 1 },
            'resistor': { resistance: 1000, power: 0.25 },
            'capacitor': { capacitance: 100, voltage: 16 },
            'ground': {},
            'wire': { length: 100 }
        };
        
        return properties[type] || {};
    }

    buildHalfWaveRectifier() {
        this.clearCircuit();
        
        // Add components in a logical layout
        this.addComponent('ac-source', 100, 200);
        this.addComponent('diode', 250, 200);
        this.addComponent('resistor', 400, 200);
        this.addComponent('ground', 550, 200);
        
        // Add wires
        this.addWire(0, 1); // AC to Diode
        this.addWire(1, 2); // Diode to Resistor
        this.addWire(2, 3); // Resistor to Ground
        
        this.drawCircuit();
    }

    buildHalfWaveWithFilter() {
        this.clearCircuit();
        
        // Add components
        this.addComponent('ac-source', 100, 200);
        this.addComponent('diode', 250, 200);
        this.addComponent('capacitor', 350, 150);
        this.addComponent('resistor', 400, 200);
        this.addComponent('ground', 550, 200);
        
        // Add wires
        this.addWire(0, 1); // AC to Diode
        this.addWire(1, 2); // Diode to Capacitor
        this.addWire(1, 3); // Diode to Resistor
        this.addWire(2, 4); // Capacitor to Ground
        this.addWire(3, 4); // Resistor to Ground
        
        this.drawCircuit();
    }

    addWire(fromIndex, toIndex) {
        const wire = {
            id: Date.now() + Math.random(),
            from: this.components[fromIndex].id,
            to: this.components[toIndex].id,
            points: this.calculateWirePath(fromIndex, toIndex)
        };
        
        this.wires.push(wire);
    }

    calculateWirePath(fromIndex, toIndex) {
        const fromComp = this.components[fromIndex];
        const toComp = this.components[toIndex];
        
        // Simple straight line for now
        return [
            { x: fromComp.x + 40, y: fromComp.y },
            { x: toComp.x - 40, y: toComp.y }
        ];
    }

    drawCircuit() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.drawGrid();
        
        // Draw wires
        this.drawWires();
        
        // Draw components
        this.drawComponents();
    }

    drawGrid() {
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.canvas.width; x += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.canvas.height; y += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawWires() {
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        
        this.wires.forEach(wire => {
            this.ctx.beginPath();
            wire.points.forEach((point, index) => {
                if (index === 0) {
                    this.ctx.moveTo(point.x, point.y);
                } else {
                    this.ctx.lineTo(point.x, point.y);
                }
            });
            this.ctx.stroke();
        });
    }

    drawComponents() {
        this.components.forEach(component => {
            this.drawComponent(component);
        });
    }

    drawComponent(component) {
        this.ctx.save();
        
        // Highlight selected component
        if (this.selectedComponent === component.id) {
            this.ctx.shadowColor = '#e74c3c';
            this.ctx.shadowBlur = 15;
        }

        switch (component.type) {
            case 'ac-source':
                this.drawACSource(component);
                break;
            case 'diode':
                this.drawDiode(component);
                break;
            case 'resistor':
                this.drawResistor(component);
                break;
            case 'capacitor':
                this.drawCapacitor(component);
                break;
            case 'ground':
                this.drawGround(component);
                break;
        }

        this.ctx.restore();
    }

    drawACSource(comp) {
        // Draw AC source symbol (sine wave inside circle)
        this.ctx.strokeStyle = '#3498db';
        this.ctx.lineWidth = 3;
        this.ctx.fillStyle = 'white';
        
        // Circle
        this.ctx.beginPath();
        this.ctx.arc(comp.x, comp.y, 30, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Sine wave
        this.ctx.beginPath();
        this.ctx.moveTo(comp.x - 20, comp.y);
        for (let i = -20; i <= 20; i++) {
            const x = comp.x + i;
            const y = comp.y + Math.sin(i * 0.2) * 10;
            this.ctx.lineTo(x, y);
        }
        this.ctx.stroke();
        
        // Label
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('AC', comp.x, comp.y + 40);
    }

    drawDiode(comp) {
        this.ctx.strokeStyle = '#e74c3c';
        this.ctx.lineWidth = 2;
        this.ctx.fillStyle = 'white';
        
        // Triangle
        this.ctx.beginPath();
        this.ctx.moveTo(comp.x - 25, comp.y - 20);
        this.ctx.lineTo(comp.x + 25, comp.y);
        this.ctx.lineTo(comp.x - 25, comp.y + 20);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // Cathode line
        this.ctx.beginPath();
        this.ctx.moveTo(comp.x - 25, comp.y - 20);
        this.ctx.lineTo(comp.x - 25, comp.y + 20);
        this.ctx.stroke();
        
        // Label
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Diode', comp.x, comp.y + 35);
    }

    drawResistor(comp) {
        this.ctx.strokeStyle = '#f39c12';
        this.ctx.lineWidth = 3;
        this.ctx.fillStyle = 'white';
        
        // Resistor body
        this.ctx.fillRect(comp.x - 30, comp.y - 15, 60, 30);
        this.ctx.strokeRect(comp.x - 30, comp.y - 15, 60, 30);
        
        // Color bands
        this.ctx.fillStyle = '#8e44ad';
        this.ctx.fillRect(comp.x - 15, comp.y - 15, 5, 30);
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(comp.x, comp.y - 15, 5, 30);
        this.ctx.fillRect(comp.x + 10, comp.y - 15, 5, 30);
        
        // Label
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('1kΩ', comp.x, comp.y + 40);
    }

    drawCapacitor(comp) {
        this.ctx.strokeStyle = '#9b59b6';
        this.ctx.lineWidth = 3;
        
        // Capacitor plates
        this.ctx.beginPath();
        this.ctx.moveTo(comp.x - 20, comp.y - 20);
        this.ctx.lineTo(comp.x - 20, comp.y + 20);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(comp.x + 20, comp.y - 20);
        this.ctx.lineTo(comp.x + 20, comp.y + 20);
        this.ctx.stroke();
        
        // Label
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('100μF', comp.x, comp.y + 35);
    }

    drawGround(comp) {
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 3;
        
        // Ground symbol
        this.ctx.beginPath();
        this.ctx.moveTo(comp.x - 20, comp.y);
        this.ctx.lineTo(comp.x + 20, comp.y);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(comp.x - 15, comp.y + 5);
        this.ctx.lineTo(comp.x + 15, comp.y + 5);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(comp.x - 10, comp.y + 10);
        this.ctx.lineTo(comp.x + 10, comp.y + 10);
        this.ctx.stroke();
    }

    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if clicked on a component
        const clickedComponent = this.findComponentAt(x, y);
        
        if (clickedComponent) {
            this.selectedComponent = clickedComponent.id;
            this.dragging = true;
            this.dragOffset.x = x - clickedComponent.x;
            this.dragOffset.y = y - clickedComponent.y;
            this.updatePropertiesPanel(clickedComponent);
        } else {
            this.selectedComponent = null;
            this.updatePropertiesPanel();
        }
        
        this.drawCircuit();
    }

    handleCanvasMouseMove(e) {
        if (this.dragging && this.selectedComponent) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const component = this.components.find(c => c.id === this.selectedComponent);
            if (component) {
                component.x = Math.round((x - this.dragOffset.x) / 20) * 20;
                component.y = Math.round((y - this.dragOffset.y) / 20) * 20;
                this.drawCircuit();
            }
        }
    }

    findComponentAt(x, y) {
        return this.components.find(comp => {
            const distance = Math.sqrt(
                Math.pow(comp.x - x, 2) + Math.pow(comp.y - y, 2)
            );
            return distance < 30; // Click radius
        });
    }

    updatePropertiesPanel(component = null) {
        const panel = document.getElementById('propertiesContent');
        
        if (!component) {
            panel.innerHTML = '<p>Select a component to edit its properties</p>';
            return;
        }
        
        let html = `<h4>${component.type.toUpperCase()} Properties</h4>`;
        
        Object.entries(component.properties).forEach(([key, value]) => {
            html += `
                <div class="property-control">
                    <label>${key}:</label>
                    <input type="number" value="${value}" 
                           onchange="circuitBuilder.updateProperty('${component.id}', '${key}', this.value)">
                </div>
            `;
        });
        
        panel.innerHTML = html;
    }

    updateProperty(componentId, property, value) {
        const component = this.components.find(c => c.id === componentId);
        if (component) {
            component.properties[property] = parseFloat(value);
            this.drawCircuit();
        }
    }

    clearCircuit() {
        this.components = [];
        this.wires = [];
        this.selectedComponent = null;
        this.drawCircuit();
    }

    startSimulation() {
        // Add visual feedback
        document.querySelector('.circuit-workspace').classList.add('simulating');
        
        // Start waveform simulation
        if (window.waveformSimulator) {
            window.waveformSimulator.start(this.components);
        }
    }

    resetSimulation() {
        document.querySelector('.circuit-workspace').classList.remove('simulating');
        
        if (window.waveformSimulator) {
            window.waveformSimulator.stop();
        }
    }

    analyzeCircuit() {
        // Simple circuit analysis
        const analysis = this.performCircuitAnalysis();
        this.displayAnalysisResults(analysis);
    }

    performCircuitAnalysis() {
        // Basic circuit analysis logic
        const hasDiode = this.components.some(c => c.type === 'diode');
        const hasCapacitor = this.components.some(c => c.type === 'capacitor');
        const hasResistor = this.components.some(c => c.type === 'resistor');
        
        let type = 'Invalid Circuit';
        if (hasDiode && hasResistor) {
            type = hasCapacitor ? 'Half Wave Rectifier with Filter' : 'Half Wave Rectifier';
        }
        
        return {
            circuitType: type,
            components: this.components.length,
            isValid: hasDiode && hasResistor
        };
    }

    displayAnalysisResults(analysis) {
        alert(`Circuit Analysis:\nType: ${analysis.circuitType}\nComponents: ${analysis.components}\nValid: ${analysis.isValid ? 'Yes' : 'No'}`);
    }
}

// Initialize circuit builder when page loads
let circuitBuilder;
document.addEventListener('DOMContentLoaded', () => {
    circuitBuilder = new CircuitBuilder();
    window.circuitBuilder = circuitBuilder;
});
