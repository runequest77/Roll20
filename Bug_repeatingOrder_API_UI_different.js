//Roll20の検証用スクリプト
//
//ブラウザから入力した時とAPIから入力した時で、repeating attributeの並び順が変わる。
//_reporder_repeating_隠しattributeによる並べ替えがないとき、UIからは大文字小文字の区別あり、APIからは大文字小文字の区別なしで順序が判定されている。
//バグ報告をした。
//https://app.roll20.net/forum/post/10704926/repeating-order-is-different-between-ui-and-api
//
on('chat:message', function(msg) {
    //!rq77_2 @{selected|character_name}
    if(msg.type != 'api' || msg.content.indexOf('!rq77_2 ')) return;
    let content = msg.content.replace("!rq77_2 ", "");

    // !rq77_2 character_name,attribute_name,@{character_name|attribute_name}
    const param = content.split(',');
    const character_name = param[0].trim();
    const attribute_name = param[1].trim();
    const ui_result = param[2].trim();
    
    command = `@{${character_name}|${attribute_name}}`
    sendChat("rq77_2_result1","API:" + command + "<br />UI:" + ui_result);
})
