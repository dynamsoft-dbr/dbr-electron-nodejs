var license = 't0076xQAAAAcFqMcZtCGB5D8vRTBXad8V2NKTE1zGUqtblrPsHlabRNIjl4TJKnCzvlxXMuZJFyFRJ853pRcbQcUgDexIgHm1DMIfaDAqcg==';

if (process.platform === 'win32') {
    console.log('Windows');
}
else if(process.platform === 'linux') {
    console.log('Linux');
}
else if(process.platform === 'darwin') {
    console.log('macOS');
}
else {
    console.log('Unknown Operating System');
}

var dbr = require('./build/Release/dbr.node');
// var dbr = require('./bin/darwin-x64-80/nodejs-barcode.node')
var formats = {
    'OneD': 0x000007FF,
    'PDF417': 0x02000000,
    'QRCode': 0x04000000,
    'DataMatrix': 0x08000000,
    'Aztec': 0x10000000
}

var barcodeTypes = formats.OneD | formats.PDF417 | formats.QRCode | formats.DataMatrix | formats.Aztec;  // 1D, PDF417, QRCODE, DataMatrix, Aztec Code

// Initialize DBR license.
// Please visit https://www.dynamsoft.com/CustomerPortal/Portal/Triallicense.aspx or contact support@dynamsoft.com to get a valid trial or full license.
dbr.initLicense(license);

/*
 * https://github.com/Keillion/www.keillion.site/blob/v0/js/task-queue.js
 */
var TaskQueue = function(){
    /// <summary>
    /// @class TaskQueue
    /// </summary>

    this._queue = [];
    this.isWorking = false;

    /// <param name="timeout" type="int">
    /// Timeout between task.
    /// Between the interval, other work can be done, such as UI-response work.
    /// </param>
    this.timeout = 100;
};

TaskQueue.prototype.push = function(task, context, args, handleReturn){
    /// <summary>
    /// Push task. If <span>!isWorking</span>, start the task queue automatically.
    /// </summary>

    this._queue.push({
        "task": task,
        "context": context,
        "args": args,
        "handleReturn": handleReturn
    });
    if(!this.isWorking){
        this.next();
    }
};

TaskQueue.prototype.unshift = function(task, context, args, handleReturn){
    /// <summary>
    /// Push task. If <span>!isWorking</span>, start the task queue automatically.
    /// </summary>

    this._queue.unshift({
        "task": task,
        "context": context,
        "args": args,
        "handleReturn": handleReturn
    });
    if(!this.isWorking){
        this.next();
    }
};

TaskQueue.prototype.next = function(){
    /// <summary>
    /// Do the next task.
    /// You need to call it manually in the end of your task.
    /// To assure <function>next</function> will be called,
    /// in some case you can put the function in <span>finally</span>,
    /// in other case you should carefully handle <span>setTimeout</span>.
    /// </summary>

    if(this._queue.length == 0){
        this.isWorking = false;
        return;
    }
    this.isWorking = true;
    var item = this._queue.shift();
    var task = item.task;
    var taskContext = item.context ? item.context : null;
    var taskArguments = item.args ? item.args : [];
    var handleReturn = item.handleReturn;
    // console.log(`debug: ${JSON.stringify(item)}`)
    setTimeout(function(){
        var ret = task.apply(taskContext, taskArguments);
        if(typeof handleReturn == 'function'){
            handleReturn(ret);
        }
    }, this.timeout);
};


var dbrTaskQueue = new TaskQueue();
dbrTaskQueue.timeout = 0;
module.exports = {
    decodefile: async function() {
        console.log(dbr)
        console.log(`dbr: ${JSON.stringify(dbr)}`)

        var callback = arguments[2];
        // arguments[2] = function(){
        //     try{
        //         callback.apply(this, arguments);
        //     }catch(ex){
        //         setTimeout(function(){throw ex;},0); // when the user defined callback throw err, taskqueue can still work
        //     }
        //     dbrTaskQueue.next();
        // };
        // eslint-disable-next-line no-unused-vars
        arguments[2] = new Promise((resolve, reject) => {
            arguments.push(resolve)
            callback.apply(this, arguments)
        })
        dbrTaskQueue.unshift(dbr.decodeFileSync, null, Array.from(arguments));
    },
    decodeFileAsync: function(){
        var callback = arguments[2];
        arguments[2] = function(){
            try{
                callback.apply(this, arguments);
            }catch(ex){
                setTimeout(function(){throw ex;},0); // when the user defined callback throw err, taskqueue can still work
            }
            dbrTaskQueue.next();
        };
        dbrTaskQueue.push(dbr.decodeFileAsync, null, Array.from(arguments));
    },
    decodeFileStreamAsync: function(){
        var callback = arguments[3];
        arguments[3] = function(){
            try{
                callback.apply(this, arguments);
            }catch(ex){
                setTimeout(function(){throw ex;},0); // when the user defined callback throw err, taskqueue can still work
            }
            dbrTaskQueue.next();
        };
        dbrTaskQueue.push(dbr.decodeFileStreamAsync, null, Array.from(arguments));
    },
    decodeBase64Async: function(){
        var callback = arguments[2];
        arguments[2] = function(){
            try{
                callback.apply(this, arguments);
            }catch(ex){
                setTimeout(function(){throw ex;},0); // when the user defined callback throw err, taskqueue can still work
            }
            dbrTaskQueue.next();
        };
        dbrTaskQueue.push(dbr.decodeBase64Async, null, Array.from(arguments));
    },
    decodeYUYVAsync: function(){
        var callback = arguments[4];
        arguments[4] = function(){
            try{
                callback.apply(this, arguments);
            }catch(ex){
                setTimeout(function(){throw ex;},0); // when the user defined callback throw err, taskqueue can still work
            }
            dbrTaskQueue.next();
        };
        dbrTaskQueue.push(dbr.decodeYUYVAsync, null, Array.from(arguments));
    },
    formats: formats,
    initLicense: dbr.initLicense,
    barcodeTypes: barcodeTypes,
    setParameters: dbr.setParameters,
    decodeBufferAsync: function(){
        let maxBufferLength = 1
        if (arguments.length == 8) {
            maxBufferLength = arguments[7]
        }
        
        if (dbrTaskQueue._queue.length > maxBufferLength) return; 
        
        var callback = arguments[5];
        arguments[5] = function(){
            try{
                callback.apply(this, arguments);
            }catch(ex){
                setTimeout(function(){throw ex;},0); // when the user defined callback throw err, taskqueue can still work
            }
            dbrTaskQueue.next();
        };
        dbrTaskQueue.push(dbr.decodeBufferAsync, null, Array.from(arguments));
    },
};