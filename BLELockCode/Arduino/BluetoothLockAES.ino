// Bluetooth Low Energy Lock
// (c) Joe Scott, produced using code by Don Coleman.
//Base code: http://github.com/don/BluetoothLock.git


#include <AESLib.h>
#include <SPI.h>
#include "Adafruit_BLE_UART.h"

#define LOCK_PIN 6
#define RED_LED_PIN 7
#define GREEN_LED_PIN 8

// Connect CLK/MISO/MOSI to hardware SPI
// e.g. On UNO & compatible: CLK=13, MISO = 12, MOSI = 11
#define ADAFRUITBLE_REQ 10
#define ADAFRUITBLE_RDY 2 // interrupt pin 2 or 3 on UNO
#define ADAFRUITBLE_RST 9

uint8_t key[] = {0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15};

long secret = 12345;

long openTime = 0;

// Default status from the Bluefruit LE driver
int lastStatus = ACI_EVT_DISCONNECTED;

//Create BTLESerial object providing
Adafruit_BLE_UART BTLEserial = Adafruit_BLE_UART(ADAFRUITBLE_REQ, ADAFRUITBLE_RDY, ADAFRUITBLE_RST);

void setup() {
  //Set data rate
  Serial.begin(9600);
  //Begin BTLE serial service
  Serial.println(F("BLE Lock"));

  BTLEserial.begin();

  //Set pin modes and initial values (LOW)
  pinMode(LOCK_PIN, OUTPUT);
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(GREEN_LED_PIN, OUTPUT);
  digitalWrite(LOCK_PIN, LOW);
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, LOW);
}

void loop() {

  BTLEserial.pollACI();

  //Check if the status has changed
  int status = BTLEserial.getState();

  if (status != lastStatus) {

    if (status == ACI_EVT_DEVICE_STARTED) {
      Serial.println(F("*Advertising..."));
    }

    else if (status == ACI_EVT_CONNECTED) {
      Serial.println(F("*Connected..."));
    }

    else if (status == ACI_EVT_DISCONNECTED) {
      Serial.println(F("*Disconnected..."));
    }
    // save for next loop
    lastStatus = status;
  }

  if (status == ACI_EVT_CONNECTED) {
    
    // see if there's any data from bluetooth
    if (BTLEserial.available()) {
      Serial.print("* ");
      Serial.print(BTLEserial.available());
      Serial.println(F(" bytes available from BTLE"));
    }

    // keeping u + code for compatibility with the serial api
    if (BTLEserial.find("u")) {
      String scode = BTLEserial.readString();
      char *ccode = &scode[0];
      aes128_dec_single(key, ccode);
      int code = atoi(ccode);
      openLock(code);
    }

      // keeping k + code for compatibility with the serial api
//     if (BTLEserial.find("k")) {
//       String skey = BTLEserial.readString();
//       char *ckey = &skey[0];
//       
//     }
    
  }

  // close lock and reset lights after x seconds
  if (openTime && millis() - openTime > 8000) {
    closeLock();
  }

}

void openLock(long code) {
  openTime = millis();  // set even if bad code so we can reset the lights
  if (code == secret) {
    // open the lock
    Serial.println("Opening lock");
    digitalWrite(GREEN_LED_PIN, HIGH);
    digitalWrite(RED_LED_PIN, LOW);
    digitalWrite(LOCK_PIN, HIGH); // open the lock
    BTLEserial.println("unlocked");
  } else {
    // bad code, don't open
    Serial.println("Invalid code " + code);
    digitalWrite(RED_LED_PIN, HIGH);
    BTLEserial.println("invalid code");
  }
}

// closes the lock and resets the lights
void closeLock() {
  // reset the lights
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, LOW);
  digitalWrite(LOCK_PIN, LOW); // close the lock
  BTLEserial.println("locked");
  openTime = 0;
}
