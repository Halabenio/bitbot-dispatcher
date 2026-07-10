input.onButtonPressed(Button.A, function () {
    if (Status == 1) {
        SettingNumber += -1
        if (SettingNumber < 0) {
            SettingNumber = 20
        }
        basic.showNumber(SettingNumber)
    } else if (Status == 2) {
        if (SettingNumber == 5) {
            SettingNumber += -4
        } else {
            SettingNumber += -5
        }
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
        radio.setGroup(Gateway * 10)
        serial.writeNumber(Gateway * 10)
        Occupancy = []
        for (let index = 0; index < Address_Space; index++) {
            Occupancy.push(0)
        }
        Occupancy[0] = 5
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
        if (SettingNumber == 1) {
            SettingNumber += 4
        } else {
            SettingNumber += 5
        }
        if (SettingNumber > 50) {
            SettingNumber = 1
        }
        basic.showNumber(SettingNumber)
    }
})
radio.onReceivedValue(function (name, value) {
    serial.writeValue(name, value)
    basic.showIcon(IconNames.Heart)
    if (name == "CarAwait") {
        basic.showIcon(IconNames.Duck)
        Dispatched = false
        for (let Occupied of Occupancy) {
            if (Occupied == 0) {
                basic.showIcon(IconNames.Giraffe)
                radio.sendValue("CarDispatch", Occupancy.indexOf(Occupied))
                Occupancy[Occupancy.indexOf(Occupied)] = 1
                Dispatched = true
                break;
            }
        }
        if (!(Dispatched)) {
            basic.showIcon(IconNames.Ghost)
            radio.sendValue("GatewayFull", value)
        }
    } else if (name == "ControllerAwait") {
        Dispatched = false
        for (let Occupied of Occupancy) {
            if (Occupied == 1) {
                radio.sendValue("ControllerDispatch", Occupancy.indexOf(Occupied))
                Occupancy[Occupancy.indexOf(Occupied)] = 2
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
                Occupancy[Occupancy.indexOf(Occupied)] = 2
                Dispatched = true
                break;
            }
        }
        if (!(Dispatched)) {
            radio.sendValue("NoCars", value)
        }
    } else if (name == "DoubleCar") {
        Occupancy[value] = 1
        Dispatched = false
        for (let Occupied of Occupancy) {
            if (Occupied == 0) {
                radio.sendValue("CarDispatch", Occupancy.indexOf(Occupied))
                Occupancy[Occupancy.indexOf(Occupied)] = 1
                Dispatched = true
                break;
            }
        }
        if (!(Dispatched)) {
            radio.sendValue("GatewayFull", value)
        }
    } else if (name == "DoubleController") {
        Occupancy[value] = 2
        Dispatched = false
        for (let Occupied of Occupancy) {
            if (Occupied == 1) {
                radio.sendValue("ControllerDispatch", Occupancy.indexOf(Occupied))
                Occupancy[Occupancy.indexOf(Occupied)] = 2
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
let SettingNumber = 0
let Occupancy: number[] = []
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
    radio.setGroup(Gateway * 10)
    serial.writeNumber(Gateway * 10)
    Occupancy = []
    for (let index = 0; index < Address_Space - 1; index++) {
        Occupancy.push(0)
    }
}
