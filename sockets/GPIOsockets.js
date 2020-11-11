const fs = require('fs');
const Gpio = require('onoff').Gpio;
const updateJsonFile = require('update-json-file');

module.exports.GPIO = function(io){
  io.on('connection', (socket) => {
    let err = false
    let fileLength
    let fileNames = []
    let switch_ids = []
    let switch_pins = []
    let switch_values = []
    let switch_names = []

    // Scan .json files and push names in to array
    fs.readdirSync('./switches').forEach(file => {
      fileNames.push(file)
    });
    fileLength = fileNames.length
    
    // Get switch infos
    for (i = 0; i < fileLength; i++) {
      rawdata = fs.readFileSync('./switches/'+fileNames[i]);
      json_data = JSON.parse(rawdata)
      switch_ids.push(json_data.id)
      switch_pins.push(json_data.pin)
      switch_values.push(json_data.status)
      switch_names.push(json_data.name)
    }

    // Set pins
    for (i = 0; i < fileLength; i++) {
      try {
        this["switch_"+i] = new Gpio(switch_pins[i], 'out');
        if (switch_values[i] == 'Off')
          this["switch_"+i].writeSync(1);
      } catch(e) {
        err = true
        socket.emit('error_', e);
      }
    }

    // Send switch status to client
    if (!err) {
      for (i = 0; i < fileLength; i++) {
        socket.emit('switches', {
          id: switch_ids[i],
          status: switch_values[i],
          name: switch_names[i]
        });
      }
    }
    
    socket.on('edit_name', (data) => {
      var filePath =  './switches/'+fileNames[switch_ids.indexOf(data.id)]
      updateJsonFile(filePath, (data_) => {
        data_.name = data.new_name
        return data_
      });
      console.log(data)
    });


    socket.on('btn_press', (id) => {
      var switchId = this["switch_"+switch_ids.indexOf(id)]
      var filePath =  './switches/'+fileNames[switch_ids.indexOf(id)]
      val = switchId.readSync()
      if (val == 1) {
        switchId.writeSync(0);
        io.local.emit('update_btn_status', {id: id, status: 'On'});
        updateJsonFile(filePath, (data) => {
          data.status = 'On'
          return data
        });
      }
      if (val == 0) {
        switchId.writeSync(1);
        io.local.emit('update_btn_status', {id: id, status: 'Off'});
        updateJsonFile(filePath, (data) => {
          data.status = 'Off'
          return data
        });
      }
    });
    
    
  });
}