//Roll20API用サンプル
//2022/02/20 runequest77
//キャラクターシートの繰り返しセクションを取り出す。
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

function getSortedRepeatingAttributes(character_id,repeating_section) {
    'use strict';
    log("character_id:" + character_id);

    let attributes = findObjs({ type: 'attribute', _characterid: character_id }).filter( a => {
        return (a.get("name").indexOf(`repeating_${repeating_section}_`) == 0);
    });

    let attr = {}
    attributes.forEach(a => {
        let name = a.get("name");
        //★ポイント！　チャット上からは番号指定できるけど実際の記録は個別のattributeをsectionにつけた固有IDで束ねている形式。
        //個々のattributeからは番号はわからない。
        //repeating_melee_-Mq1qrga1bggG8OFeyMN_weapon_type
        let match = name.match(/^repeating_[\w]{1,}_([-\w]{20})_([_-\w]*$)/);
        log("JSON.stringify(match):" + JSON.stringify(match));
        if (match[1] in attr === false)  attr[match[1]] = {};
        attr[match[1]][match[2]] = a.get("current");
    })
    log("JSON.stringify(attr):" + JSON.stringify(attr));
    
    //★ポイント！　並び順を変更した場合に作られるattribute。存在したら、その順序に取りに行く。
    let order = [];
    const reporder = findObjs({ type: 'attribute', _characterid: character_id, name:`_reporder_repeating_` + repeating_section});
    if (reporder.length == 1) {
        order = reporder.split("|");
    } else {
        //並び変えていない場合はsectionのid順だろうという推測。idの取得形式については別の記事で解説。
        order = Object.keys(attr).sort();
    }
    let result = [];
    result = order.map( id => attr[id]);
    log("JSON.stringify(result):" + JSON.stringify(result));
    return result;
}
