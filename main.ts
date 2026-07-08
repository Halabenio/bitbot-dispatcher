input.onButtonPressed(Button.A, function () {
    if (Status == 1) {
        SettingNumber += -1
        if (SettingNumber < 0) {
            SettingNumber = 20
        }
        basic.showNumber(SettingNumber)
    } else if (Status == 2) {
        SettingNumber += -5
        if (SettingNumber < 1) {
            SettingNumber = 50
        }
        basic.showNumber(SettingNumber)
    }
})
input.onButtonPressed(Button.AB, function () {
    if (Status == 0) {
        Status = 1
        SettingNumber = parseFloat(flashstorage.getOrDefault("Gateway", "0"))
        basic.showNumber(SettingNumber)
    } else if (Status == 1) {
        Gateway = SettingNumber
        flashstorage.put("Gateway", convertToText(SettingNumber))
        Status = 2
        SettingNumber = parseFloat(flashstorage.getOrDefault("Field", "1"))
        basic.showNumber(SettingNumber)
    } else if (Status == 2) {
        Address_Space = SettingNumber
        flashstorage.put("Field", convertToText(SettingNumber))
        Status = 3
        basic.showLeds(`
            # . # . #
            . . # . .
            # # # # #
            . . # . .
            # . # . #
            `)
        radio.setGroup(Gateway)
        Occupancy = []
        for (let index = 0; index < Address_Space - 1; index++) {
            Occupancy.push(0)
        }
    } else if (Status == 3) {
        Status = 1
        SettingNumber = parseFloat(flashstorage.getOrDefault("Gateway", "0"))
        basic.showNumber(SettingNumber)
    }
})
input.onButtonPressed(Button.B, function () {
    if (Status == 1) {
        SettingNumber += 1
        if (SettingNumber > 20) {
            SettingNumber = 0
        }
        basic.showNumber(SettingNumber)
    } else if (Status == 2) {
        SettingNumber += 5
        if (SettingNumber > 50) {
            SettingNumber = 1
        }
        basic.showNumber(SettingNumber)
    }
})
radio.onReceivedValue(function (name, value) {
    let list: number[] = []
    if (name == "CarAwait") {
        Dispatched = false
        for (let Occupied of Occupancy) {
            if (Occupied == 0) {
                radio.sendValue("CarDispatch", Occupancy.indexOf(Occupied))
                list[Occupancy.indexOf(Occupied)] = 1
                Dispatched = true
                break;
            }
        }
        if (!(Dispatched)) {
            radio.sendValue("GatewayFull", value)
        }
    } else if (name == "ControllerAwait") {
        Dispatched = false
        for (let Occupied of Occupancy) {
            if (Occupied == 1) {
                radio.sendValue("ControllerDispatch", Occupancy.indexOf(Occupied))
                list[Occupancy.indexOf(Occupied)] = 2
                Dispatched = true
                break;
            }
        }
        if (!(Dispatched)) {
            radio.sendValue("NoCars", value)
        }
    } else if (name == "ControllerDisconnect") {
        Occupancy[value] = 1
    } else if (name == "NoCar") {
        Occupancy[value] = 0
        Dispatched = false
        for (let Occupied of Occupancy) {
            if (Occupied == 1) {
                radio.sendValue("ControllerDispatch", Occupancy.indexOf(Occupied))
                list[Occupancy.indexOf(Occupied)] = 2
                Dispatched = true
                break;
            }
        }
        if (!(Dispatched)) {
            radio.sendValue("NoCars", value)
        }
    }
})
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    if (Status == 1) {
        basic.clearScreen()
        basic.showString("Gateway")
        basic.showNumber(SettingNumber)
    } else if (Status == 2) {
        basic.clearScreen()
        basic.showString("Address Space")
        basic.showNumber(SettingNumber)
    }
})
let Dispatched = false
let Occupancy: number[] = []
let SettingNumber = 0
let Address_Space = 0
let Gateway = 0
let Status = 0
Status = 0
// Unset
basic.showLeds(`
    # . . . #
    . . . . .
    . . # . .
    . . . . .
    # . . . #
    `)
if (flashstorage.getOrDefault("Field", "NotSet") != "NotSet") {
    Status = 3
    Gateway = parseFloat(flashstorage.getOrDefault("Gateway", "0"))
    Address_Space = parseFloat(flashstorage.get("Field"))
    basic.showLeds(`
        # . # . #
        . . # . .
        # # # # #
        . . # . .
        # . # . #
        `)
}
