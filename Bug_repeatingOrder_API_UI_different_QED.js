//UIからのsendChatとAPIからのsendChatでRepeatingオブジェクトのオーダー指定がズレる問題の証明
//
on('chat:message', function(msg) {
    //!rq77_4 @{selected|character_name},sorceryspells,spellname,@{selected|repeating_sorceryspells_$0_spellname},@{selected|repeating_sorceryspells_$1_spellname},@{selected|repeating_sorceryspells_$2_spellname},@{selected|repeating_sorceryspells_$3_spellname},@{selected|repeating_sorceryspells_$4_spellname},@{selected|repeating_sorceryspells_$5_spellname},@{selected|repeating_sorceryspells_$6_spellname},@{selected|repeating_sorceryspells_$7_spellname},@{selected|repeating_sorceryspells_$8_spellname},@{selected|repeating_sorceryspells_$9_spellname}
    if(msg.type != 'api' || msg.content.indexOf('!rq77_4 ')) return;
    let content = msg.content.replace("!rq77_4 ", "");

    const param = content.split(',');
    const character_name = param[0].trim();
    const section_name = param[1].trim();
    const attr_name = param[2].trim();
    param.map( m => log('UI_order:' + m) );

    let command = [];
    for (let i = 0; i < 10; i++) {
        command.push(`@{${character_name}|repeating_${section_name}_$${i}_${attr_name}}`);
    }

    sendchatp(command.join(",")).then(res => {
        const param_api = res[0].content.split(',');
        param_api.map( m => log('API_order:' + m) );

        const character_id = findObjs({'_type':'character','name':character_name})[0].id;

        let regex = new RegExp("repeating_" + section_name + "_.{20}_" + attr_name);

        let attributes = findObjs({ type: 'attribute', _characterid: character_id })
            .filter( a => {
                return regex.test(a.get("name"));
            });

        log("----sensitive----");
        attributes
            .sort( (a,b) => {
                 return  (a.get("name").toString() > b.get("name").toString()) ?  1 : -1;
            })
            .map( a => {
                log( a.get("name") + ":" + a.get("current") );
            });
    
        log("----insensitive----");
        attributes
            .sort( (a,b) => {
                 return  (a.get("name").toString().toLowerCase() > b.get("name").toString().toLowerCase()) ?  1 : -1;
            })
            .map( a => {
                log(a.get("name") + ":" + a.get("current"));
            });

        sendChat(msg.who,"rq77_4:End"); 
    })

})

function sendchatp(x) {
	return new Promise((resolve) =>{
 		sendChat('',x,(res)=>{
			resolve(res);
		});
	});
}


/*
Test Result

UI_order:sn0
UI_order:sn1
UI_order:sn2
UI_order:sn3
UI_order:sn4
UI_order:sn5
UI_order:sn6
UI_order:sn7
UI_order:sn8
UI_order:sn9

API_order:sn0
API_order:sn1
API_order:sn2
API_order:sn3
API_order:sn6
API_order:sn4
API_order:sn7
API_order:sn5
API_order:sn8
API_order:sn9

----sensitive----
repeating_sorceryspells_-Mq-dhYHICQzjMkuyiYB_spellname:sn0
repeating_sorceryspells_-Mq-dozg4oo7ccZKKeMz_spellname:sn1
repeating_sorceryspells_-Mq-e-KbvyjOnGWZWVQG_spellname:sn2
repeating_sorceryspells_-Mq-e4VKFTBbemZ69WbW_spellname:sn3
repeating_sorceryspells_-Mq-eAS-CMGtLi23ujXp_spellname:sn4
repeating_sorceryspells_-Mq-eIlLJeUdMctIiojZ_spellname:sn5
repeating_sorceryspells_-Mq-eaKLnWyI-QpNErew_spellname:sn6
repeating_sorceryspells_-Mq-edz5dpmcC4GiTfQS_spellname:sn7
repeating_sorceryspells_-Mq-exQmbGDlu1LqOHCq_spellname:sn8
repeating_sorceryspells_-Mq-f-4xHGkPbXIlQ-sW_spellname:sn9

----insensitive----
repeating_sorceryspells_-Mq-dhYHICQzjMkuyiYB_spellname:sn0
repeating_sorceryspells_-Mq-dozg4oo7ccZKKeMz_spellname:sn1
repeating_sorceryspells_-Mq-e-KbvyjOnGWZWVQG_spellname:sn2
repeating_sorceryspells_-Mq-e4VKFTBbemZ69WbW_spellname:sn3
repeating_sorceryspells_-Mq-eaKLnWyI-QpNErew_spellname:sn6
repeating_sorceryspells_-Mq-eAS-CMGtLi23ujXp_spellname:sn4
repeating_sorceryspells_-Mq-edz5dpmcC4GiTfQS_spellname:sn7
repeating_sorceryspells_-Mq-eIlLJeUdMctIiojZ_spellname:sn5
repeating_sorceryspells_-Mq-exQmbGDlu1LqOHCq_spellname:sn8
repeating_sorceryspells_-Mq-f-4xHGkPbXIlQ-sW_spellname:sn9
/*
