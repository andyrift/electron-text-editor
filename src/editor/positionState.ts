import { ref, Ref } from "vue";
import { IPositionState, Position } from "./plugins";

export class PositionState implements IPositionState {

  positions: Ref<Position[]> = ref([])

  setPositions(positions: Position[]): void {
    this.positions.value = positions
  }

}