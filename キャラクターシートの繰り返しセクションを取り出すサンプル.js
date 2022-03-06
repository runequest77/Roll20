//Roll20API用サンプル
//2022/02/20 runequest77
//キャラクターシートの繰り返しセクションを取り出す。
//
//■■注意■■
//Roll20のAPIのsendChatとUIのチャットでrepeatingのインデックスがズレる現象を確認しています。
//大文字小文字の区別の問題なので対策も可能ですが、公式が修正すると対策が逆に働くので、しばらく様子見。
//■■■■■■■■
//
//このサンプルはrunequest3の近接戦闘武器で作ってあります。必要に応じてsection_nameを変えたりパラメータ化したりしましょう。
//
//チャットから下記書式で実行してください。
// !rq77_1 キャラクター名
//
//　セクション名についてはキャラクターシートからF12。developperツール使って「検証」で調べる。
//  文字列「fieldset」で検索するとrepeating_XXXみたいな形で見つかるxxxがセクション名。
//
//やりたかったこと
//　繰り返しセクションの名前と番号のセットを取り出してキャラクターにコマンドで選択させたい。
//　選択したらその番号で武器攻撃、呪文投射したい。

on('chat:message', function(msg) {
    //!rq77_1 @{selected|character_name}
    if(msg.type != 'api' || msg.content.indexOf('!rq77_1 ')) return;
    let content = msg.content.replace("!rq77_1 ", "");

    //パラメーター分解と検証。このサンプルでは1パラメータなのであまり意味はない。
    const param = content.split(',');
    const character_name = param[0].trim();
    const character = findObjs({ type: 'character', _name: character_name});
    if (character.length === 0) {
        sendChat("rq77_1",`ERROR:キャラクター [${character_name}] が見つかりません。`);
        return;
    }

    //ここが本体です。
    //characterは配列で帰ってきているので[0]が必要。
    const section_name = "melee";
    const melee = getSortedRepeatingAttributes(character[0].id,section_name);

    //チャットに選択コンボボックスを表示するフォーマットを作成
    //わざわざforループを使ってるのはインデックスを値として使うから
    //あと、[]()の書式使うときは、文字列中に[]()が入ってるとれパースがバグるので本当は取って来た文字列にサニタイズ必要です。
    let combo = [];
    for (let i = 0; i < melee.length; i++) {
        let m = melee[i];
        combo.push(`${m.weapon_type}:${m.wpn_attk_value}%,${i}`);
    }

    const result = "[武器の選択テスト](!dumyyapi ?{武器の選択テスト。戻り値は武器番号。|" + combo.join("|") + "})";
    sendChat("rq77_1",result);
})

//繰り返しアトリビュートをキャラクターシートの並び順の配列として返す
function getSortedRepeatingAttributes(character_id,repeating_section) {
    'use strict';
    log("character_id:" + character_id);

    let attributes = findObjs({ type: 'attribute', _characterid: character_id }).filter( a => {
        return (a.get("name").indexOf(`repeating_${repeating_section}_`) == 0);
    });

    //attributeのグループIDを連想配列のkeyとして、行ごとに列を集約
    let attr = {}
    attributes.forEach(a => {
        let name = a.get("name");
        //repeating_melee_-Mq1qrga1bggG8OFeyMN_weapon_type
        let match = name.match(/^repeating_[\w]{1,}_([-\w]{20})_([_-\w]*$)/);
        if (match[1] in attr === false) {
            attr[match[1]] = { "_key": match[1] };
        }
        attr[match[1]][match[2]] = a.get("current");
    })
    
    let apiorder = Object.keys(attr);
    //UIとAPIで並び順が変わるバグに暫定対応
    //APIは大文字小文字を区別せずに並べ替え
    apiorder.sort( (a,b) => {
        return  (a.toString().toLowerCase() > b.toString().toLowerCase()) ?  1 : -1;
    });
    log("API ORDER:" + apiorder);
    for (let i = 0; i < apiorder.length; i++) {
        let a = attr[apiorder[i]];
        a['_apiorder'] = i;
    }

    //UIは大文字小文字を区別して並べ替え(大文字が前に来るのでアルファベット順にならない)。
    let sensitiveorder = Object.keys(attr);
    sensitiveorder.sort;
    for (let i = 0; i < sensitiveorder.length; i++) {
        let a = attr[sensitiveorder[i]];
        a['_sensitiveorder'] = i;
    }
    log("sensitive ORDER:" + sensitiveorder);
    
    //並び順を変更した場合に作られるattribute。存在したら、その順序に取りに行く。
    let result = [];
    const attr_reporder = getAttrByName( character_id, `_reporder_repeating_` + repeating_section );

    let uiorder = sensitiveorder;
    if (attr_reporder) {
        let reporder = attr_reporder.split("|");
        let short = sensitiveorder.filter(i => reporder.indexOf(i) == -1)
        uiorder = reporder.concat(short);
    } else {
        log("_reporder_repeating_:not exists");
    }
    log("UI ORDER:" + uiorder);
    for (let i = 0; i < uiorder.length; i++) {
        let a = attr[uiorder[i]];
        a['_uiorder'] = i;
        result.push(a);
    }

    return result;
}
