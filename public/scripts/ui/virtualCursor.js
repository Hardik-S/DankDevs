export class VirtualCursor {
    constructor(options) {
        this.options = options;
    }
    render() {
        const { x, y } = this.options.state.snapshot.cursor;
        this.options.element.style.transform = `translate(${x}px, ${y}px)`;
    }
}
//# sourceMappingURL=virtualCursor.js.map