import { describe, expect, it } from "bun:test"
import { mapProgressClickToTargetSec } from "../now-playing.seek"

describe("now-playing seek mapping", () => {
  it("maps click at bar start to zero", () => {
    const target = mapProgressClickToTargetSec({
      clickX: 10,
      barStartX: 10,
      barWidth: 20,
      durationSec: 200,
    })

    expect(target).toBe(0)
  })

  it("maps click at bar end to duration", () => {
    const target = mapProgressClickToTargetSec({
      clickX: 29,
      barStartX: 10,
      barWidth: 20,
      durationSec: 200,
    })

    expect(target).toBe(200)
  })

  it("returns null for clicks outside the bar", () => {
    expect(
      mapProgressClickToTargetSec({
        clickX: 9,
        barStartX: 10,
        barWidth: 20,
        durationSec: 200,
      }),
    ).toBeNull()
  })
})
