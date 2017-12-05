//https://en.wikipedia.org/wiki/Adler-32
//using this to get a short hash id for each alarm

define(function(require){
    //going to stringify a js object and pass it into this. it's the best I got right now.
    function adler32StringHash(inputString){        
        var bytes = []; 
        for(var i = 0; i < inputString.length; i++){                      
            bytes.push(inputString.charCodeAt(i));
        }
        var hash = adler32(bytes, bytes.length);
        return hash;
    }

    //data == array of bytes, len == data.length, since we don't have access to a toByteArray method in js
    function adler32(data, len)
    /* 
        where data is the location of the data in physical memory and 
        len is the length of the data in bytes 
    */
    {
        var MOD_ADLER = 65521;

        var a = 1;
        var b = 0;    
        
        // Process each byte of the data in order
        for (var index = 0; index < len; ++index)
        {
            a = (a + data[index]) % MOD_ADLER;
            b = (b + a) % MOD_ADLER;
        }
        
        //if b was unsigned int, b << 16 would work, but js has no usigned int type
        //convert to hex
        return parseInt(b, 16) | a;
    }

    return adler32StringHash;
});
