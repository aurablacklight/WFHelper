import { describe, expect, it } from "vitest";
import { rivenEffects } from "../../services/buildAdvisor/rivenEffects";

const stat = (tag: string, name: string, displayValue: number, multiplier = false) => ({
  tag,
  name,
  displayValue,
  multiplier,
});

describe("rivenEffects", () => {
  it("turns the decoder's percentages into bonuses the calculator knows", () => {
    const { effects, ignored } = rivenEffects(
      [
        stat("WeaponCritChanceMod", "Critical Chance", 231.7),
        stat("WeaponFireIterationsMod", "Multishot", 67.9),
        stat("WeaponDamageAmountMod", "Damage", 193.9),
        stat("WeaponReloadSpeedMod", "Reload Speed", -4),
      ],
      1,
    );
    expect(ignored).toEqual([]);
    expect(effects).toHaveLength(4);
    expect(effects[0]).toEqual({ stat: "criticalChance", value: expect.closeTo(2.317, 9) });
    expect(effects[1]).toEqual({ stat: "multishot", value: expect.closeTo(0.679, 9) });
    expect(effects[2]).toEqual({ stat: "damage", value: expect.closeTo(1.939, 9) });
    expect(effects[3]).toEqual({ stat: "reloadSpeed", value: expect.closeTo(-0.04, 9) });
  });

  it("reads elemental and physical stats as typed damage", () => {
    const { effects } = rivenEffects(
      [
        stat("WeaponFireDamageMod", "Heat", 90),
        stat("WeaponToxinDamageMod", "Toxin", 60),
        stat("WeaponArmorPiercingDamageMod", "Puncture", -85),
      ],
      1,
    );
    expect(effects).toEqual([
      { stat: "typedDamage", damageType: "heat", value: expect.closeTo(0.9, 9) },
      { stat: "typedDamage", damageType: "toxin", value: expect.closeTo(0.6, 9) },
      { stat: "typedDamage", damageType: "puncture", value: expect.closeTo(-0.85, 9) },
    ]);
  });

  it("rescales for a variant with a different disposition", () => {
    // Rolled on a 1.3 disposition weapon, used on a 1.04 one: four fifths.
    const { effects } = rivenEffects([stat("WeaponCritChanceMod", "Critical Chance", 200)], 0.8);
    expect(effects).toEqual([{ stat: "criticalChance", value: expect.closeTo(1.6, 9) }]);
  });

  it("lists the stats it does not model with their values", () => {
    const { effects, ignored } = rivenEffects(
      [
        stat("WeaponZoomFovMod", "Zoom", -5.9),
        stat("WeaponFactionDamageCorpus", "Damage to Corpus", 1.32, true),
        stat("WeaponProcTimeMod", "Status Duration", 14.5),
      ],
      1,
    );
    expect(effects).toEqual([]);
    expect(ignored).toEqual(["-5.9% Zoom", "x1.32 Damage to Corpus", "+14.5% Status Duration"]);
  });
});
