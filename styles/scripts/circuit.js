class CircuitDiagram {
    constructor(svgElement) {
        this.svg = svgElement;
        this.ns = "http://www.w3.org/2000/svg";
        this.components = {};
        this.currentAnimation = null;
    }

    clear() {
        while (this.svg.firstChild) {
            this.svg.removeChild(this.svg.firstChild);
        }
        this.components = {};
    }

    drawWithoutFilter() {
        this.clear();
        
        // Draw AC Source
        this.drawACSource(100, 100, 60, 30);
        
        // Draw Transformer
        this.drawTransformer(200, 80, 40, 60);
        
        // Draw Diode
        this.drawDiode(300, 100, 40, 20, 'D1');
        
        // Draw Resistor
        this.drawResistor(400, 100, 40, 20, 'R_L');
        
        // Draw Ground
        this.drawGround(500, 120, 20);
        
        // Draw connecting wires
        this.drawWire(100, 115, 200, 115); // AC to transformer
        this.drawWire(240, 115, 280, 115); // Transformer to diode
        this.drawWire(340, 115, 380, 115); // Diode to resistor
        this.drawWire(440, 115, 500, 115); // Resistor to ground
        this.drawWire(100, 85, 200, 85);   // AC return
        this.drawWire(240, 85, 500, 85);   // Common ground line
        
        // Add current flow animation
        this.animateCurrentFlow();
    }

    drawWithFilter() {
        this.clear();
        
        // Draw AC Source
        this.drawACSource(100, 100, 60, 30);
        
        // Draw Transformer
        this.drawTransformer(200, 80, 40, 60);
        
        // Draw Diode
        this.drawDiode(300, 100, 40, 20, 'D1');
        
        // Draw Resistor
        this.drawResistor(450, 100, 40, 20, 'R_L');
        
        // Draw Capacitor
        this.drawCapacitor(380, 80, 30, 40, 'C1');
        
        // Draw Ground
        this.drawGround(520, 120, 20);
        
        // Draw connecting wires
        this.drawWire(100, 115, 200, 115); // AC to transformer
        this.drawWire(240, 115, 280, 115); // Transformer to diode
        this.drawWire(340, 115, 450, 115); // Diode to resistor
        this.drawWire(490, 115, 520, 115); // Resistor to ground
        this.drawWire(100, 85, 200, 85);   // AC return
        this.drawWire(240, 85, 520, 85);   // Common ground line
        this.drawWire(380, 115, 380, 85);  // Capacitor connection
        
        // Add current flow animation
        this.animateCurrentFlow();
    }

    drawACSource(x, y, width, height) {
        const group = document.createElementNS(this.ns, "g");
        group.setAttribute("class", "component");
        
        // Sine wave symbol
        const sinePath = document.createElementNS(this.ns, "path");
        sinePath.setAttribute("d", `M${x},${y} C${x+width/4},${y-height/2} ${x+3*width/4},${y+height/2} ${x+width},${y}`);
        sinePath.setAttribute("stroke", "#3498db");
        sinePath.setAttribute("stroke-width", "3");
        sinePath.setAttribute("fill", "none");
        
        // AC label
        const label = document.createElementNS(this.ns, "text");
        label.setAttribute("x", x + width/2);
        label.setAttribute("y", y - 20);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("fill", "#2c3e50");
        label.setAttribute("font-weight", "bold");
        label.textContent = "AC Source";
        
        // Voltage label
        const voltage = document.createElementNS(this.ns, "text");
        voltage.setAttribute("x", x + width/2);
        voltage.setAttribute("y", y - 5);
        voltage.setAttribute("text-anchor", "middle");
        voltage.setAttribute("fill", "#7f8c8d");
        voltage.setAttribute("font-size", "12");
        voltage.textContent = "6V RMS";
        
        group.appendChild(sinePath);
        group.appendChild(label);
        group.appendChild(voltage);
        this.svg.appendChild(group);
        
        this.components.acSource = group;
    }

    drawTransformer(x, y, width, height) {
        const group = document.createElementNS(this.ns, "g");
        group.setAttribute("class", "component");
        
        // Primary coil
        for (let i = 0; i < 4; i++) {
            const line = document.createElementNS(this.ns, "line");
            line.setAttribute("x1", x);
            line.setAttribute("y1", y + i * height/3);
            line.setAttribute("x2", x + width/2);
            line.setAttribute("y2", y + i * height/3);
            line.setAttribute("stroke", "#e67e22");
            line.setAttribute("stroke-width", "2");
            group.appendChild(line);
        }
        
        // Core
        const core = document.createElementNS(this.ns, "rect");
        core.setAttribute("x", x + width/2 - 2);
        core.setAttribute("y", y);
        core.setAttribute("width", "4");
        core.setAttribute("height", height);
        core.setAttribute("fill", "#95a5a6");
        group.appendChild(core);
        
        // Secondary coil
        for (let i = 0; i < 4; i++) {
            const line = document.createElementNS(this.ns, "line");
            line.setAttribute("x1", x + width/2 + 4);
            line.setAttribute("y1", y + i * height/3);
            line.setAttribute("x2", x + width);
            line.setAttribute("y2", y + i * height/3);
            line.setAttribute("stroke", "#e67e22");
            line.setAttribute("stroke-width", "2");
            group.appendChild(line);
        }
        
        // Label
        const label = document.createElementNS(this.ns, "text");
        label.setAttribute("x", x + width/2);
        label.setAttribute("y", y + height + 15);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("fill", "#2c3e50");
        label.setAttribute("font-size", "12");
        label.textContent = "6-0-6V";
        
        group.appendChild(label);
        this.svg.appendChild(group);
        
        this.components.transformer = group;
    }

    drawDiode(x, y, width, height, id) {
        const group = document.createElementNS(this.ns, "g");
        group.setAttribute("class", "component");
        group.setAttribute("id", id);
        
        // Diode body (triangle + line)
        const triangle = document.createElementNS(this.ns, "polygon");
        triangle.setAttribute("points", 
            `${x},${y - height/2} ${x + width},${y} ${x},${y + height/2}`
        );
        triangle.setAttribute("fill", "#ecf0f1");
        triangle.setAttribute("stroke", "#2c3e50");
        triangle.setAttribute("stroke-width", "2");
        
        const line = document.createElementNS(this.ns, "line");
        line.setAttribute("x1", x);
        line.setAttribute("y1", y - height/2);
        line.setAttribute("x2", x);
        line.setAttribute("y2", y + height/2);
        line.setAttribute("stroke", "#2c3e50");
        line.setAttribute("stroke-width", "2");
        
        // Cathode line
        const cathode = document.createElementNS(this.ns, "line");
        cathode.setAttribute("x1", x - 5);
        cathode.setAttribute("y1", y + height/2);
        cathode.setAttribute("x2", x + 5);
        cathode.setAttribute("y2", y + height/2);
        cathode.setAttribute("stroke", "#2c3e50");
        cathode.setAttribute("stroke-width", "2");
        
        // Label
        const label = document.createElementNS(this.ns, "text");
        label.setAttribute("x", x + width/2);
        label.setAttribute("y", y - height/2 - 10);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("fill", "#2c3e50");
        label.setAttribute("font-size", "12");
        label.textContent = "IN4001";
        
        group.appendChild(triangle);
        group.appendChild(line);
        group.appendChild(cathode);
        group.appendChild(label);
        this.svg.appendChild(group);
        
        this.components.diode = group;
    }

    drawResistor(x, y, width, height, id) {
        const group = document.createElementNS(this.ns, "g");
        group.setAttribute("class", "component");
        group.setAttribute("id", id);
        
        // Resistor body
        const body = document.createElementNS(this.ns, "rect");
        body.setAttribute("x", x);
        body.setAttribute("y", y - height/2);
        body.setAttribute("width", width);
        body.setAttribute("height", height);
        body.setAttribute("fill", "#f39c12");
        body.setAttribute("stroke", "#2c3e50");
        body.setAttribute("stroke-width", "2");
        body.setAttribute("rx", "5");
        
        // Color bands
        const bands = 4;
        const bandWidth = width / (bands + 1);
        for (let i = 1; i <= bands; i++) {
            const band = document.createElementNS(this.ns, "rect");
            band.setAttribute("x", x + i * bandWidth);
            band.setAttribute("y", y - height/2);
            band.setAttribute("width", "2");
            band.setAttribute("height", height);
            band.setAttribute("fill", i === 1 ? "#8e44ad" : "#2c3e50");
            group.appendChild(band);
        }
        
        // Label
        const label = document.createElementNS(this.ns, "text");
        label.setAttribute("x", x + width/2);
        label.setAttribute("y", y - height/2 - 10);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("fill", "#2c3e50");
        label.setAttribute("font-size", "12");
        label.textContent = "1kΩ";
        
        group.appendChild(body);
        group.appendChild(label);
        this.svg.appendChild(group);
        
        this.components.resistor = group;
    }

    drawCapacitor(x, y, width, height, id) {
        const group = document.createElementNS(this.ns, "g");
        group.setAttribute("class", "component");
        group.setAttribute("id", id);
        
        // Capacitor plates
        const plate1 = document.createElementNS(this.ns, "line");
        plate1.setAttribute("x1", x);
        plate1.setAttribute("y1", y - height/2);
        plate1.setAttribute("x2", x);
        plate1.setAttribute("y2", y + height/2);
        plate1.setAttribute("stroke", "#27ae60");
        plate1.setAttribute("stroke-width", "3");
        
        const plate2 = document.createElementNS(this.ns, "line");
        plate2.setAttribute("x1", x + width);
        plate2.setAttribute("y1", y - height/2);
        plate2.setAttribute("x2", x + width);
        plate2.setAttribute("y2", y + height/2);
        plate2.setAttribute("stroke", "#27ae60");
        plate2.setAttribute("stroke-width", "3");
        
        // Label
        const label = document.createElementNS(this.ns, "text");
        label.setAttribute("x", x + width/2);
        label.setAttribute("y", y - height/2 - 10);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("fill", "#2c3e50");
        label.setAttribute("font-size", "12");
        label.textContent = "100μF";
        
        group.appendChild(plate1);
        group.appendChild(plate2);
        group.appendChild(label);
        this.svg.appendChild(group);
        
        this.components.capacitor = group;
    }

    drawGround(x, y, size) {
        const group = document.createElementNS(this.ns, "g");
        
        // Ground symbol (3 horizontal lines)
        for (let i = 0; i < 3; i++) {
            const line = document.createElementNS(this.ns, "line");
            line.setAttribute("x1", x - size + i * size/2);
            line.setAttribute("y1", y + i * size/2);
            line.setAttribute("x2", x + size - i * size/2);
            line.setAttribute("y2", y + i * size/2);
            line.setAttribute("stroke", "#2c3e50");
            line.setAttribute("stroke-width", "2");
            group.appendChild(line);
        }
        
        this.svg.appendChild(group);
        this.components.ground = group;
    }

    drawWire(x1, y1, x2, y2) {
        const line = document.createElementNS(this.ns, "line");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("stroke", "#2c3e50");
        line.setAttribute("stroke-width", "2");
        this.svg.appendChild(line);
    }

    animateCurrentFlow() {
        if (this.currentAnimation) {
            clearInterval(this.currentAnimation);
        }
        
        let isPositiveHalf = true;
        this.currentAnimation = setInterval(() => {
            // Highlight diode during positive half cycle
            const diode = this.components.diode;
            if (diode) {
                if (isPositiveHalf) {
                    diode.classList.add('diode-active');
                } else {
                    diode.classList.remove('diode-active');
                }
            }
            
            // Animate capacitor if present
            const capacitor = this.components.capacitor;
            if (capacitor) {
                if (isPositiveHalf) {
                   
