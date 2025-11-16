const initialState = {
    cursor: { x: 200, y: 200 },
    transcript: [],
};
export class State {
    constructor() {
        this.state = structuredClone(initialState);
    }
    get snapshot() {
        return structuredClone(this.state);
    }
    update(mutator) {
        const draft = structuredClone(this.state);
        mutator(draft);
        this.state = draft;
        return this.snapshot;
    }
}
//# sourceMappingURL=state.js.map