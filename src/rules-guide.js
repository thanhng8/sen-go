import { t } from './i18n.js';

const GUIDE = {
  vi: {
    headings: ['Mục tiêu của ván đấu', 'Chơi từng lượt như thế nào?', 'Khi nào ván đấu kết thúc?', 'Cách tính điểm', 'Ví dụ tính điểm', 'Điều cần nhớ'],
    terms: ['Cách tính', 'Komi', 'Lặp thế cờ', 'Tự sát', 'Lãnh thổ', 'Diện tích', 'Ko đơn', 'Siêu Ko', 'Không cho phép', 'Cho phép'],
    goal: 'Mục tiêu không phải là bắt hết quân đối phương. Hãy dùng quân để bao quanh nhiều giao điểm trống, giữ các nhóm của mình sống và làm yếu vùng đất của đối thủ.',
    ending: 'Khi không còn vùng đáng tranh, hãy bắt các nhóm chết khỏi bàn rồi Bỏ lượt. Hai lần bỏ lượt liên tiếp kết thúc ván; nút “Tính điểm” chấm ngay vị trí hiện tại.',
    japanese: ['Thắng bằng lãnh thổ trống và số quân đã bắt', 'Đen đi trước. Quân cùng màu nối ngang hoặc dọc thành một nhóm và dùng chung khí. Nhóm hết khí bị bắt. Cấm tự sát. Ko đơn cấm bắt lại ngay nếu tái tạo vị trí của một nước trước.', 'Đếm giao điểm trống được mỗi màu bao kín, rồi cộng số quân đối phương đã bắt. Vùng chạm cả hai màu là trung lập.', 'Điểm = lãnh thổ trống + quân bắt được; Trắng cộng 6.5 Komi.', 'Đen có 38 đất và bắt 6 quân: 44 điểm. Trắng có 34 đất, bắt 3 quân và nhận 6.5 Komi: 43.5 điểm. Đen thắng 0.5.', 'Luật Nhật thưởng trực tiếp cho việc bắt quân. Hãy bắt nhóm chết khỏi bàn trước khi tính điểm.'],
    chinese: ['Thắng bằng tổng quân sống trên bàn và lãnh thổ', 'Cách đặt, nối và bắt quân giống luật Nhật; cấm tự sát. Siêu Ko cấm tạo lại bất kỳ vị trí bàn cờ nào đã xuất hiện trước đó.', 'Đếm toàn bộ quân sống trên bàn và giao điểm trống được mỗi màu bao kín. Tù binh không được cộng riêng vì việc bắt đã làm giảm diện tích đối phương.', 'Điểm = quân sống trên bàn + lãnh thổ trống; Trắng cộng 7.5 Komi.', 'Đen có 42 quân và 33 đất: 75 điểm. Trắng có 38 quân, 29 đất và 7.5 Komi: 74.5 điểm. Đen thắng 0.5.', 'Luật Trung Quốc dễ kiểm đếm: quân sống và đất đều có điểm. Đi trong đất an toàn thường không đổi tổng diện tích.'],
    'new-zealand': ['Tính diện tích và cho phép tự bắt quân', 'Cách đặt, nối và bắt quân giống luật Trung Quốc. Bạn được phép đi khiến nhóm mình hết khí; nhóm đó sẽ bị nhấc khỏi bàn. Siêu Ko vẫn cấm mọi nước tái tạo vị trí cũ.', 'Đếm quân sống và lãnh thổ trống. Không cộng tù binh hoặc quân tự sát. Komi 7.0 nên ván có thể hòa.', 'Điểm = quân sống trên bàn + lãnh thổ trống; Trắng cộng 7.0 Komi.', 'Đen có 40 quân và 35 đất: 75 điểm. Trắng có 37 quân, 31 đất và 7 Komi: 75 điểm. Kết quả hòa.', 'Tự sát là quyền chọn hiếm khi có lợi. Trong phần lớn tình huống, hãy giữ nhiều khí như bình thường.'],
  },
  en: {
    headings: ['Goal of the match', 'How does each turn work?', 'When does the match end?', 'How scoring works', 'Scoring example', 'Remember'],
    terms: ['Scoring', 'Komi', 'Repetition', 'Suicide', 'Territory', 'Area', 'Simple Ko', 'Superko', 'Forbidden', 'Allowed'],
    goal: 'The goal is not to capture every opposing stone. Use stones to surround empty intersections, keep your groups alive and weaken the opponent’s territory.',
    ending: 'When no valuable area remains, capture dead groups and Pass. Two consecutive passes end the match; “Score now” scores the current board immediately.',
    japanese: ['Win with empty territory and captured stones', 'Black starts. Orthogonally connected stones share liberties. A group with no liberties is captured. Suicide is forbidden. Simple Ko prevents an immediate recapture that recreates the previous position.', 'Count empty intersections fully surrounded by each color, then add captured enemy stones. Space touching both colors is neutral.', 'Score = empty territory + captures; White adds 6.5 Komi.', 'Black has 38 territory and 6 captures: 44. White has 34 territory, 3 captures and 6.5 Komi: 43.5. Black wins by 0.5.', 'Japanese scoring rewards captures directly. Remove dead groups before scoring.'],
    chinese: ['Win with living stones plus territory', 'Placement, connection and capture work as in Japanese rules; suicide is forbidden. Positional superko forbids recreating any earlier board position.', 'Count every living stone and each empty intersection surrounded by a color. Captures are not added separately because removing stones already changes area.', 'Score = stones on board + empty territory; White adds 7.5 Komi.', 'Black has 42 stones and 33 territory: 75. White has 38 stones, 29 territory and 7.5 Komi: 74.5. Black wins by 0.5.', 'Chinese area scoring is easy to verify: living stones and territory both count.'],
    'new-zealand': ['Area scoring with self-capture allowed', 'Play and capture as in Chinese rules. You may play a move that leaves your group with no liberties; that group is removed. Superko still forbids recreating an earlier position.', 'Count living stones and empty territory. Captures and self-captured stones are not added. Komi is 7.0, so a draw is possible.', 'Score = stones on board + empty territory; White adds 7.0 Komi.', 'Black has 40 stones and 35 territory: 75. White has 37 stones, 31 territory and 7 Komi: 75. The match is a draw.', 'Suicide is an option, not a goal. In most positions, protect your liberties normally.'],
  },
  zh: {
    headings: ['对局目标', '每回合如何进行？', '何时结束？', '如何计分', '计分示例', '请记住'],
    terms: ['计分方式', '贴目', '重复局面', '自杀', '地', '面积', '单劫', '超级劫', '禁止', '允许'],
    goal: '目标不是吃掉所有对方棋子。用棋子围住空点、保证己方棋块存活，并削弱对方的地。',
    ending: '没有可争之处时，先提走死子再虚手。连续两次虚手结束对局；“计算得分”会立即按当前棋盘计分。',
    japanese: ['以空地和提子取胜', '黑先。上下左右相连的棋子共享气；无气的棋块被提走。禁止自杀。单劫禁止立即回提并重现上一局面。', '计算每方完全围住的空点，再加上提掉的对方棋子。接触双方的空点为中立。', '得分 = 空地 + 提子；白棋加 6.5 贴目。', '黑有38目地并提6子，共44分。白有34目地、提3子并加6.5贴目，共43.5分。黑胜0.5分。', '日本规则直接奖励提子。计分前请先提走死子。'],
    chinese: ['以盘上活子和地的总和取胜', '落子、连接和提子与日本规则相同；禁止自杀。位置超级劫禁止重现任何曾出现的棋盘局面。', '计算盘上活子和每方围住的空点。提子不另加分，因为去掉对方棋子已改变面积。', '得分 = 盘上棋子 + 空地；白棋加 7.5 贴目。', '黑有42子和33目地，共75分。白有38子、29目地和7.5贴目，共74.5分。黑胜0.5分。', '中国面积计分容易核对：活子和地都计分。'],
    'new-zealand': ['面积计分并允许自提', '行棋和提子与中国规则相同。可以下出令己方棋块无气的棋，该棋块会被提走；超级劫仍禁止重现旧局面。', '计算活子和空地。不另加提子或自杀子。贴目为7.0，因此可能和棋。', '得分 = 盘上棋子 + 空地；白棋加 7.0 贴目。', '黑40子加35目地，共75分。白37子加31目地和7贴目，也为75分，结果和棋。', '自杀只是可选手段，通常并无好处。大多数情况下仍应保护气。'],
  },
  ja: {
    headings: ['対局の目的', '一手ごとの進め方', '対局の終了', '得点の数え方', '得点例', '覚えておくこと'],
    terms: ['計算法', 'コミ', '局面反復', '自殺手', '地', '面積', '単純コウ', 'スーパーコウ', '禁止', '許可'],
    goal: '相手の石をすべて取ることが目的ではありません。空点を囲い、自分の石を生かし、相手の地を弱めます。',
    ending: '争う場所がなくなったら死に石を取り、パスします。連続2回のパスで終了し、「採点」は現在の盤面をすぐ数えます。',
    japanese: ['空き地と取った石で勝つ', '黒が先手。上下左右でつながる石は呼吸点を共有し、呼吸点がなくなると取られます。自殺手は禁止。単純コウでは直前の局面を再現する取り返しができません。', '各色が完全に囲んだ空点に、取った相手の石を加えます。両色に接する空点は中立です。', '得点 = 地 + 取った石。白にコミ6.5。', '黒は地38とアゲハマ6で44点。白は地34、アゲハマ3、コミ6.5で43.5点。黒の0.5目勝ち。', '日本ルールでは取った石が直接得点になります。採点前に死に石を取り除きます。'],
    chinese: ['盤上の生きた石と地で勝つ', '石の置き方・連結・取り方は日本ルールと同じで、自殺手は禁止。スーパーコウは過去のどの盤面の再現も禁じます。', '盤上の生きた石と囲んだ空点を数えます。取った石は面積を変えているため別に加えません。', '得点 = 盤上の石 + 地。白にコミ7.5。', '黒は石42と地33で75点。白は石38、地29、コミ7.5で74.5点。黒の0.5目勝ち。', '中国式の面積計算は、生きた石と地の両方を数えるので確認しやすい方式です。'],
    'new-zealand': ['面積計算で自殺手を許可', '中国ルールと同様に打ちますが、自分の一団の呼吸点をゼロにする手も可能で、その一団は盤から除かれます。スーパーコウは過去の局面の再現を禁じます。', '生きた石と地を数え、取った石や自殺した石は加えません。コミ7.0なので引き分けがあります。', '得点 = 盤上の石 + 地。白にコミ7.0。', '黒は石40と地35で75点。白は石37、地31、コミ7で75点。引き分けです。', '自殺手は選択肢ですが、多くの場合は不利です。通常は呼吸点を守りましょう。'],
  },
  ko: {
    headings: ['대국 목표', '각 차례는 어떻게 진행하나요?', '언제 끝나나요?', '계가 방법', '계가 예시', '기억할 점'],
    terms: ['계가 방식', '덤', '반복', '자충', '집', '면적', '단순 패', '슈퍼코', '금지', '허용'],
    goal: '상대 돌을 모두 잡는 것이 목표가 아닙니다. 빈 점을 둘러싸고 내 돌을 살리며 상대 영역을 약화시키세요.',
    ending: '더 다툴 곳이 없으면 사석을 잡고 패스하세요. 연속 두 번 패스하면 끝나며, “계가”는 현재 판을 즉시 계산합니다.',
    japanese: ['빈 집과 잡은 돌로 승리', '흑이 먼저 둡니다. 상하좌우로 연결된 돌은 활로를 공유하며 활로가 없으면 잡힙니다. 자충은 금지됩니다. 단순 패는 직전 모양으로 즉시 되잡는 것을 금지합니다.', '각 색이 완전히 둘러싼 빈 점에 잡은 상대 돌을 더합니다. 양쪽 색에 닿은 곳은 중립입니다.', '점수 = 빈 집 + 잡은 돌, 백은 덤 6.5.', '흑은 집 38과 잡은 돌 6개로 44점. 백은 집 34, 잡은 돌 3개, 덤 6.5로 43.5점. 흑 0.5점 승.', '일본식은 잡은 돌이 직접 점수가 됩니다. 계가 전에 사석을 제거하세요.'],
    chinese: ['살아 있는 돌과 집의 합으로 승리', '놓기·연결·잡기는 일본식과 같고 자충은 금지됩니다. 위치 슈퍼코는 이전에 나온 모든 판 모양의 반복을 금지합니다.', '판 위의 살아 있는 돌과 둘러싼 빈 점을 셉니다. 잡은 돌은 면적 변화에 반영되므로 따로 더하지 않습니다.', '점수 = 판 위 돌 + 빈 집, 백은 덤 7.5.', '흑은 돌 42와 집 33으로 75점. 백은 돌 38, 집 29, 덤 7.5로 74.5점. 흑 0.5점 승.', '중국식 면적 계가는 살아 있는 돌과 집을 모두 세므로 확인하기 쉽습니다.'],
    'new-zealand': ['면적 계가와 자충 허용', '중국식처럼 두지만 내 돌무리의 활로를 없애는 수가 허용되며 그 돌무리는 제거됩니다. 슈퍼코는 여전히 이전 모양의 반복을 막습니다.', '살아 있는 돌과 빈 집을 셉니다. 잡은 돌과 자충으로 제거된 돌은 더하지 않습니다. 덤 7.0이라 무승부가 가능합니다.', '점수 = 판 위 돌 + 빈 집, 백은 덤 7.0.', '흑은 돌 40과 집 35로 75점. 백은 돌 37, 집 31, 덤 7로 75점. 무승부입니다.', '자충은 선택 사항일 뿐 대개 이득이 없습니다. 보통은 활로를 지키세요.'],
  },
  es: {
    headings: ['Objetivo de la partida', '¿Cómo funciona cada turno?', '¿Cuándo termina?', 'Cómo se puntúa', 'Ejemplo de puntuación', 'Recuerda'],
    terms: ['Puntuación', 'Komi', 'Repetición', 'Suicidio', 'Territorio', 'Área', 'Ko simple', 'Superko', 'Prohibido', 'Permitido'],
    goal: 'No necesitas capturar todas las piedras rivales. Rodea intersecciones vacías, mantén vivos tus grupos y debilita el territorio enemigo.',
    ending: 'Cuando no quede nada importante por disputar, captura los grupos muertos y pasa. Dos pases seguidos terminan la partida; “Puntuar” calcula el tablero actual.',
    japanese: ['Gana con territorio vacío y piedras capturadas', 'Negro empieza. Las piedras conectadas comparten libertades; un grupo sin libertades se captura. El suicidio está prohibido. El Ko simple impide recapturar de inmediato la posición anterior.', 'Cuenta las intersecciones vacías rodeadas por cada color y suma las piedras enemigas capturadas. El espacio que toca ambos colores es neutral.', 'Puntos = territorio vacío + capturas; Blanco suma 6.5 de Komi.', 'Negro tiene 38 de territorio y 6 capturas: 44. Blanco tiene 34, 3 capturas y 6.5 de Komi: 43.5. Negro gana por 0.5.', 'Las reglas japonesas premian las capturas directamente. Retira grupos muertos antes de puntuar.'],
    chinese: ['Gana con piedras vivas más territorio', 'Colocar, conectar y capturar funciona como en las reglas japonesas; se prohíbe el suicidio. El superko prohíbe repetir cualquier posición anterior.', 'Cuenta cada piedra viva y cada intersección vacía rodeada. Las capturas no se suman por separado porque ya reducen el área rival.', 'Puntos = piedras en el tablero + territorio vacío; Blanco suma 7.5 de Komi.', 'Negro: 42 piedras + 33 de territorio = 75. Blanco: 38 + 29 + 7.5 = 74.5. Negro gana por 0.5.', 'La puntuación china es fácil de revisar: cuentan las piedras vivas y el territorio.'],
    'new-zealand': ['Puntuación de área con suicidio permitido', 'Se juega como en las reglas chinas, pero puedes dejar tu propio grupo sin libertades y se retira. El superko sigue impidiendo repetir posiciones.', 'Cuenta piedras vivas y territorio vacío. No suma capturas ni piedras autosacrificadas. Con Komi 7.0 puede haber empate.', 'Puntos = piedras en el tablero + territorio vacío; Blanco suma 7.0 de Komi.', 'Negro: 40 piedras + 35 de territorio = 75. Blanco: 37 + 31 + 7 = 75. Empate.', 'El suicidio es una opción poco útil. Normalmente debes proteger tus libertades.'],
  },
  fr: {
    headings: ['But de la partie', 'Comment jouer chaque tour ?', 'Quand finit la partie ?', 'Calcul du score', 'Exemple de score', 'À retenir'],
    terms: ['Comptage', 'Komi', 'Répétition', 'Suicide', 'Territoire', 'Aire', 'Ko simple', 'Superko', 'Interdit', 'Autorisé'],
    goal: "Le but n’est pas de capturer toutes les pierres adverses. Entourez des intersections vides, gardez vos groupes vivants et affaiblissez le territoire adverse.",
    ending: "Quand il ne reste plus de zone importante, capturez les groupes morts puis passez. Deux passes terminent la partie ; « Compter » évalue immédiatement le plateau.",
    japanese: ['Gagner avec le territoire vide et les captures', 'Noir commence. Les pierres reliées partagent leurs libertés ; un groupe sans liberté est capturé. Le suicide est interdit. Le Ko simple interdit la reprise immédiate de la position précédente.', 'Comptez les intersections vides entièrement entourées puis ajoutez les pierres adverses capturées. Les zones touchant les deux couleurs sont neutres.', 'Score = territoire vide + captures ; Blanc ajoute 6,5 de Komi.', 'Noir : 38 de territoire + 6 captures = 44. Blanc : 34 + 3 captures + 6,5 = 43,5. Noir gagne de 0,5.', 'Les règles japonaises récompensent directement les captures. Retirez les groupes morts avant le comptage.'],
    chinese: ['Gagner avec les pierres vivantes et le territoire', 'Placement, connexion et capture suivent les règles japonaises ; le suicide est interdit. Le superko interdit toute position déjà rencontrée.', 'Comptez chaque pierre vivante et chaque intersection vide entourée. Les captures ne sont pas ajoutées séparément.', 'Score = pierres sur le plateau + territoire vide ; Blanc ajoute 7,5 de Komi.', 'Noir : 42 pierres + 33 de territoire = 75. Blanc : 38 + 29 + 7,5 = 74,5. Noir gagne de 0,5.', 'Le comptage chinois est facile à vérifier : pierres vivantes et territoire comptent.'],
    'new-zealand': ['Comptage par aire avec suicide autorisé', 'Le jeu suit les règles chinoises, mais vous pouvez laisser votre groupe sans liberté ; il est alors retiré. Le superko interdit toujours les répétitions.', 'Comptez les pierres vivantes et le territoire. Captures et auto-captures ne sont pas ajoutées. Avec un Komi de 7,0, une égalité est possible.', 'Score = pierres sur le plateau + territoire vide ; Blanc ajoute 7,0 de Komi.', 'Noir : 40 pierres + 35 = 75. Blanc : 37 + 31 + 7 = 75. Égalité.', 'Le suicide est une option rarement utile. Protégez normalement vos libertés.'],
  },
  de: {
    headings: ['Ziel der Partie', 'Wie läuft ein Zug ab?', 'Wann endet die Partie?', 'Wertung', 'Wertungsbeispiel', 'Merke'],
    terms: ['Wertung', 'Komi', 'Wiederholung', 'Selbstmord', 'Gebiet', 'Fläche', 'Einfaches Ko', 'Superko', 'Verboten', 'Erlaubt'],
    goal: 'Es geht nicht darum, alle gegnerischen Steine zu fangen. Umschließe freie Punkte, halte deine Gruppen am Leben und schwäche gegnerisches Gebiet.',
    ending: 'Wenn nichts Wichtiges mehr umkämpft ist, fange tote Gruppen und passe. Zwei Pässe beenden die Partie; „Werten“ zählt die aktuelle Stellung.',
    japanese: ['Sieg durch freies Gebiet und gefangene Steine', 'Schwarz beginnt. Verbundene Steine teilen Freiheiten; ohne Freiheit werden sie gefangen. Selbstmord ist verboten. Einfaches Ko verhindert die sofortige Rücknahme zur vorherigen Stellung.', 'Zähle vollständig umschlossene freie Punkte und addiere gefangene gegnerische Steine. Punkte an beiden Farben sind neutral.', 'Punkte = freies Gebiet + Gefangene; Weiß erhält 6,5 Komi.', 'Schwarz: 38 Gebiet + 6 Gefangene = 44. Weiß: 34 + 3 + 6,5 = 43,5. Schwarz gewinnt mit 0,5.', 'Japanische Regeln belohnen Gefangene direkt. Tote Gruppen vor der Wertung entfernen.'],
    chinese: ['Sieg durch lebende Steine und Gebiet', 'Setzen, Verbinden und Fangen funktionieren wie japanisch; Selbstmord ist verboten. Superko verbietet jede frühere Brettstellung.', 'Zähle lebende Steine und umschlossene freie Punkte. Gefangene werden nicht zusätzlich gezählt.', 'Punkte = Steine auf dem Brett + freies Gebiet; Weiß erhält 7,5 Komi.', 'Schwarz: 42 Steine + 33 Gebiet = 75. Weiß: 38 + 29 + 7,5 = 74,5. Schwarz gewinnt mit 0,5.', 'Chinesische Flächenwertung ist leicht zu prüfen: Steine und Gebiet zählen.'],
    'new-zealand': ['Flächenwertung mit erlaubtem Selbstfang', 'Es gilt die chinesische Spielweise, aber eine eigene Gruppe darf ohne Freiheiten gesetzt und entfernt werden. Superko verhindert weiterhin alte Stellungen.', 'Zähle lebende Steine und Gebiet. Gefangene und selbst entfernte Steine zählen nicht extra. Mit 7,0 Komi ist Remis möglich.', 'Punkte = Steine auf dem Brett + freies Gebiet; Weiß erhält 7,0 Komi.', 'Schwarz: 40 Steine + 35 Gebiet = 75. Weiß: 37 + 31 + 7 = 75. Unentschieden.', 'Selbstfang ist selten nützlich. Schütze meist deine Freiheiten.'],
  },
  pt: {
    headings: ['Objetivo da partida', 'Como funciona cada turno?', 'Quando termina?', 'Como pontuar', 'Exemplo de pontuação', 'Lembre-se'],
    terms: ['Pontuação', 'Komi', 'Repetição', 'Suicídio', 'Território', 'Área', 'Ko simples', 'Superko', 'Proibido', 'Permitido'],
    goal: 'O objetivo não é capturar todas as pedras adversárias. Cerque interseções vazias, mantenha seus grupos vivos e enfraqueça o território rival.',
    ending: 'Quando não houver área importante em disputa, capture grupos mortos e passe. Dois passes encerram; “Pontuar” calcula o tabuleiro atual.',
    japanese: ['Vença com território vazio e pedras capturadas', 'Preto começa. Pedras conectadas compartilham liberdades; um grupo sem liberdade é capturado. Suicídio é proibido. Ko simples impede recaptura imediata da posição anterior.', 'Conte interseções vazias cercadas por cada cor e some pedras adversárias capturadas. Espaços tocando ambas as cores são neutros.', 'Pontos = território vazio + capturas; Branco soma 6,5 de Komi.', 'Preto: 38 de território + 6 capturas = 44. Branco: 34 + 3 + 6,5 = 43,5. Preto vence por 0,5.', 'As regras japonesas premiam capturas diretamente. Remova grupos mortos antes da pontuação.'],
    chinese: ['Vença com pedras vivas mais território', 'Colocação, conexão e captura seguem as regras japonesas; suicídio é proibido. Superko impede repetir qualquer posição anterior.', 'Conte cada pedra viva e interseção vazia cercada. Capturas não são somadas separadamente.', 'Pontos = pedras no tabuleiro + território vazio; Branco soma 7,5 de Komi.', 'Preto: 42 pedras + 33 de território = 75. Branco: 38 + 29 + 7,5 = 74,5. Preto vence por 0,5.', 'A pontuação chinesa é fácil de conferir: pedras vivas e território contam.'],
    'new-zealand': ['Pontuação por área com suicídio permitido', 'Joga-se como nas regras chinesas, mas seu grupo pode ficar sem liberdades e ser removido. O superko ainda impede posições antigas.', 'Conte pedras vivas e território. Capturas e auto-capturas não são somadas. Com Komi 7,0 pode haver empate.', 'Pontos = pedras no tabuleiro + território vazio; Branco soma 7,0 de Komi.', 'Preto: 40 pedras + 35 = 75. Branco: 37 + 31 + 7 = 75. Empate.', 'Suicídio raramente é útil. Normalmente proteja suas liberdades.'],
  },
  ru: {
    headings: ['Цель партии', 'Как проходит ход?', 'Когда партия заканчивается?', 'Как считать очки', 'Пример подсчёта', 'Важно помнить'],
    terms: ['Подсчёт', 'Коми', 'Повтор', 'Самоубийство', 'Территория', 'Площадь', 'Простое ко', 'Суперко', 'Запрещено', 'Разрешено'],
    goal: 'Цель не в том, чтобы снять все камни соперника. Окружайте пустые пункты, сохраняйте группы живыми и ослабляйте территорию противника.',
    ending: 'Когда спорных мест не осталось, снимите мёртвые группы и пасуйте. Два паса завершают партию; «Подсчёт» оценивает текущую позицию.',
    japanese: ['Победа территорией и пленными', 'Чёрные начинают. Связанные камни делят дыхания; группа без дыханий снимается. Самоубийство запрещено. Простое ко запрещает немедленно вернуть предыдущую позицию.', 'Считайте окружённые пустые пункты и добавьте снятые камни противника. Пункты у обоих цветов нейтральны.', 'Очки = пустая территория + пленные; белым добавляется 6,5 коми.', 'Чёрные: 38 территории + 6 пленных = 44. Белые: 34 + 3 + 6,5 = 43,5. Чёрные выигрывают 0,5.', 'Японские правила прямо награждают за пленных. Снимите мёртвые группы до подсчёта.'],
    chinese: ['Победа живыми камнями и территорией', 'Постановка, соединение и захват как в японских правилах; самоубийство запрещено. Суперко запрещает любую прежнюю позицию.', 'Считайте живые камни и окружённые пустые пункты. Пленные отдельно не добавляются.', 'Очки = камни на доске + пустая территория; белым добавляется 7,5 коми.', 'Чёрные: 42 камня + 33 территории = 75. Белые: 38 + 29 + 7,5 = 74,5. Чёрные выигрывают 0,5.', 'Китайский подсчёт легко проверить: учитываются камни и территория.'],
    'new-zealand': ['Площадь с разрешённым самозахватом', 'Игра как по китайским правилам, но можно оставить свою группу без дыханий — она снимается. Суперко всё равно запрещает старые позиции.', 'Считайте живые камни и территорию. Пленные и самозахват отдельно не добавляются. Коми 7,0 допускает ничью.', 'Очки = камни на доске + пустая территория; белым добавляется 7,0 коми.', 'Чёрные: 40 камней + 35 территории = 75. Белые: 37 + 31 + 7 = 75. Ничья.', 'Самозахват редко полезен. Обычно сохраняйте дыхания.'],
  },
  ar: {
    headings: ['هدف المباراة', 'كيف يعمل كل دور؟', 'متى تنتهي المباراة؟', 'طريقة الحساب', 'مثال للحساب', 'تذكّر'],
    terms: ['الحساب', 'كومي', 'تكرار الوضع', 'انتحار', 'أرض', 'مساحة', 'كو بسيط', 'سوبر كو', 'ممنوع', 'مسموح'],
    goal: 'الهدف ليس أسر كل أحجار الخصم. أحط التقاطعات الفارغة، وأبقِ مجموعاتك حية، وأضعف أرض الخصم.',
    ending: 'عندما لا تبقى منطقة مهمة، أَسر المجموعات الميتة ثم مرّر. تمريران متتاليان ينهيان المباراة؛ ويحسب زر النقاط اللوح الحالي.',
    japanese: ['الفوز بالأرض الفارغة والأحجار المأسورة', 'يبدأ الأسود. الأحجار المتصلة تشترك في الحريات؛ المجموعة بلا حريات تُؤسر. الانتحار ممنوع، والكو البسيط يمنع الاسترداد الفوري للوضع السابق.', 'احسب التقاطعات الفارغة المحاطة بكل لون ثم أضف أحجار الخصم المأسورة. المساحة الملامسة للونين محايدة.', 'النقاط = الأرض الفارغة + الأسر؛ يضاف للأبيض 6.5 كومي.', 'للأسود 38 أرضًا و6 أسرى = 44. للأبيض 34 و3 أسرى و6.5 كومي = 43.5. يفوز الأسود بفارق 0.5.', 'القواعد اليابانية تكافئ الأسر مباشرة. أزل المجموعات الميتة قبل الحساب.'],
    chinese: ['الفوز بالأحجار الحية مع الأرض', 'الوضع والاتصال والأسر مثل اليابانية؛ الانتحار ممنوع. السوبر كو يمنع تكرار أي وضع سابق.', 'احسب كل حجر حي وكل تقاطع فارغ محاط. لا تضاف الأسرى منفصلة.', 'النقاط = الأحجار على اللوح + الأرض الفارغة؛ يضاف للأبيض 7.5 كومي.', 'الأسود: 42 حجرًا + 33 أرضًا = 75. الأبيض: 38 + 29 + 7.5 = 74.5. يفوز الأسود بفارق 0.5.', 'حساب المساحة الصيني سهل التحقق: الأحجار والأرض كلاهما يُحسبان.'],
    'new-zealand': ['حساب المساحة مع السماح بالانتحار', 'اللعب كالقواعد الصينية، لكن يمكن ترك مجموعتك بلا حريات فتُزال. السوبر كو ما زال يمنع الأوضاع القديمة.', 'احسب الأحجار الحية والأرض. لا تضف الأسرى أو الأحجار المنتحرة. كومي 7.0 يسمح بالتعادل.', 'النقاط = الأحجار على اللوح + الأرض الفارغة؛ يضاف للأبيض 7.0 كومي.', 'الأسود: 40 حجرًا + 35 أرضًا = 75. الأبيض: 37 + 31 + 7 = 75. تعادل.', 'الانتحار خيار نادر الفائدة. احمِ حرياتك عادةً.'],
  },
  hi: {
    headings: ['मैच का लक्ष्य', 'हर चाल कैसे चलती है?', 'मैच कब समाप्त होता है?', 'स्कोर कैसे होता है', 'स्कोर उदाहरण', 'याद रखें'],
    terms: ['स्कोरिंग', 'कोमी', 'स्थिति दोहराव', 'आत्मघात', 'क्षेत्र', 'क्षेत्रफल', 'सरल को', 'सुपरको', 'निषिद्ध', 'अनुमत'],
    goal: 'लक्ष्य हर विरोधी मोहरा पकड़ना नहीं है। खाली चौराहे घेरें, अपने समूह जीवित रखें और विरोधी क्षेत्र कमजोर करें।',
    ending: 'जब कोई महत्वपूर्ण क्षेत्र न बचे, मृत समूह पकड़ें और पास करें। दो लगातार पास मैच समाप्त करते हैं; “स्कोर” वर्तमान बोर्ड गिनता है।',
    japanese: ['खाली क्षेत्र और पकड़े मोहरों से जीतें', 'काला शुरू करता है। जुड़े मोहरे स्वतंत्रता साझा करते हैं; बिना स्वतंत्रता समूह पकड़ा जाता है। आत्मघात निषिद्ध है। सरल को तुरंत पिछली स्थिति लौटाने से रोकता है।', 'हर रंग से पूरी तरह घिरे खाली चौराहे गिनें और पकड़े विरोधी मोहरे जोड़ें। दोनों रंगों से छूता स्थान तटस्थ है।', 'स्कोर = खाली क्षेत्र + पकड़े मोहरे; सफेद को 6.5 कोमी।', 'काला: 38 क्षेत्र + 6 पकड़े = 44। सफेद: 34 + 3 + 6.5 = 43.5। काला 0.5 से जीता।', 'जापानी नियम पकड़ को सीधे अंक देते हैं। स्कोर से पहले मृत समूह हटाएँ।'],
    chinese: ['जीवित मोहरे और क्षेत्र से जीतें', 'रखना, जोड़ना और पकड़ना जापानी नियम जैसा; आत्मघात निषिद्ध। सुपरको किसी पुरानी बोर्ड स्थिति को लौटने से रोकता है।', 'हर जीवित मोहरा और घिरा खाली चौराहा गिनें। पकड़े मोहरे अलग से नहीं जुड़ते।', 'स्कोर = बोर्ड के मोहरे + खाली क्षेत्र; सफेद को 7.5 कोमी।', 'काला: 42 मोहरे + 33 क्षेत्र = 75। सफेद: 38 + 29 + 7.5 = 74.5। काला 0.5 से जीता।', 'चीनी क्षेत्रफल स्कोर जाँचना आसान है: जीवित मोहरे और क्षेत्र दोनों गिने जाते हैं।'],
    'new-zealand': ['आत्मघात सहित क्षेत्रफल स्कोर', 'चीनी नियम जैसा खेलें, पर अपना समूह बिना स्वतंत्रता छोड़कर हटा सकते हैं। सुपरको फिर भी पुरानी स्थिति रोकता है।', 'जीवित मोहरे और खाली क्षेत्र गिनें। पकड़ या आत्मघाती मोहरे अलग नहीं जुड़ते। 7.0 कोमी से ड्रॉ संभव है।', 'स्कोर = बोर्ड के मोहरे + खाली क्षेत्र; सफेद को 7.0 कोमी।', 'काला: 40 मोहरे + 35 क्षेत्र = 75। सफेद: 37 + 31 + 7 = 75। ड्रॉ।', 'आत्मघात अक्सर लाभदायक नहीं होता। सामान्यतः स्वतंत्रता बचाएँ।'],
  },
  id: {
    headings: ['Tujuan pertandingan', 'Bagaimana setiap giliran?', 'Kapan pertandingan berakhir?', 'Cara menghitung skor', 'Contoh skor', 'Ingat'],
    terms: ['Penilaian', 'Komi', 'Pengulangan', 'Bunuh diri', 'Wilayah', 'Area', 'Ko sederhana', 'Superko', 'Dilarang', 'Diizinkan'],
    goal: 'Tujuannya bukan menangkap semua batu lawan. Kelilingi persimpangan kosong, jaga kelompok tetap hidup, dan lemahkan wilayah lawan.',
    ending: 'Saat tidak ada area penting tersisa, tangkap kelompok mati lalu Pass. Dua pass mengakhiri; “Hitung skor” menghitung papan saat ini.',
    japanese: ['Menang dengan wilayah kosong dan batu tangkapan', 'Hitam mulai. Batu terhubung berbagi liberty; kelompok tanpa liberty ditangkap. Bunuh diri dilarang. Ko sederhana mencegah tangkap balik langsung ke posisi sebelumnya.', 'Hitung persimpangan kosong yang dikelilingi tiap warna lalu tambah batu lawan yang ditangkap. Area yang menyentuh dua warna netral.', 'Skor = wilayah kosong + tangkapan; Putih menambah Komi 6,5.', 'Hitam punya 38 wilayah + 6 tangkapan = 44. Putih 34 + 3 + 6,5 = 43,5. Hitam menang 0,5.', 'Aturan Jepang memberi poin langsung untuk tangkapan. Hapus kelompok mati sebelum skor.'],
    chinese: ['Menang dengan batu hidup dan wilayah', 'Penempatan, sambungan, dan tangkapan seperti aturan Jepang; bunuh diri dilarang. Superko melarang semua posisi lama.', 'Hitung batu hidup dan persimpangan kosong yang dikelilingi. Tangkapan tidak ditambah terpisah.', 'Skor = batu di papan + wilayah kosong; Putih menambah Komi 7,5.', 'Hitam: 42 batu + 33 wilayah = 75. Putih: 38 + 29 + 7,5 = 74,5. Hitam menang 0,5.', 'Skor area Tiongkok mudah diperiksa: batu hidup dan wilayah dihitung.'],
    'new-zealand': ['Skor area dengan bunuh diri diizinkan', 'Bermain seperti aturan Tiongkok, tetapi kelompok sendiri boleh dibiarkan tanpa liberty lalu dihapus. Superko tetap melarang posisi lama.', 'Hitung batu hidup dan wilayah. Tangkapan dan batu bunuh diri tidak ditambah. Komi 7,0 memungkinkan seri.', 'Skor = batu di papan + wilayah kosong; Putih menambah Komi 7,0.', 'Hitam: 40 batu + 35 wilayah = 75. Putih: 37 + 31 + 7 = 75. Seri.', 'Bunuh diri jarang berguna. Biasanya lindungi liberty Anda.'],
  },
  th: {
    headings: ['เป้าหมายของเกม', 'แต่ละตาเล่นอย่างไร?', 'เกมจบเมื่อไร?', 'วิธีนับคะแนน', 'ตัวอย่างคะแนน', 'สิ่งที่ควรจำ'],
    terms: ['การนับ', 'โคมิ', 'การซ้ำตำแหน่ง', 'ฆ่าตัวเอง', 'อาณาเขต', 'พื้นที่', 'โคธรรมดา', 'ซูเปอร์โค', 'ห้าม', 'อนุญาต'],
    goal: 'เป้าหมายไม่ใช่จับหมากคู่ต่อสู้ทั้งหมด ล้อมจุดว่าง รักษากลุ่มของคุณให้มีชีวิต และทำให้อาณาเขตฝ่ายตรงข้ามอ่อนแอ',
    ending: 'เมื่อไม่มีพื้นที่สำคัญให้แย่ง จับกลุ่มตายแล้วผ่าน การผ่านสองครั้งติดกันจบเกม; “นับคะแนน” จะนับกระดานปัจจุบัน',
    japanese: ['ชนะด้วยอาณาเขตว่างและหมากที่จับได้', 'ดำเริ่มก่อน หมากที่เชื่อมกันใช้ลมหายใจร่วมกัน; กลุ่มไม่มีลมหายใจจะถูกจับ ห้ามฆ่าตัวเอง โคธรรมดาห้ามจับคืนทันทีให้กลับตำแหน่งก่อนหน้า', 'นับจุดว่างที่แต่ละสีล้อมทั้งหมด แล้วบวกหมากฝ่ายตรงข้ามที่จับได้ พื้นที่แตะทั้งสองสีเป็นกลาง', 'คะแนน = อาณาเขตว่าง + หมากที่จับ; ขาวบวกโคมิ 6.5', 'ดำมีพื้นที่ 38 และจับ 6 = 44 ขาวมี 34 จับ 3 และโคมิ 6.5 = 43.5 ดำชนะ 0.5', 'กติกาญี่ปุ่นให้คะแนนการจับโดยตรง นำกลุ่มตายออกก่อนนับ'],
    chinese: ['ชนะด้วยหมากมีชีวิตและอาณาเขต', 'การวาง เชื่อม และจับเหมือนญี่ปุ่น; ห้ามฆ่าตัวเอง ซูเปอร์โคห้ามกลับสู่ตำแหน่งใดที่เคยเกิด', 'นับหมากมีชีวิตและจุดว่างที่ล้อมไว้ หมากที่จับไม่บวกแยก', 'คะแนน = หมากบนกระดาน + อาณาเขตว่าง; ขาวบวกโคมิ 7.5', 'ดำ: 42 หมาก + 33 พื้นที่ = 75 ขาว: 38 + 29 + 7.5 = 74.5 ดำชนะ 0.5', 'การนับพื้นที่แบบจีนตรวจง่าย: นับทั้งหมากมีชีวิตและอาณาเขต'],
    'new-zealand': ['นับพื้นที่และอนุญาตให้ฆ่าตัวเอง', 'เล่นเหมือนกติกาจีน แต่สามารถทำให้กลุ่มตนไม่มีลมหายใจแล้วนำออก ซูเปอร์โคยังห้ามตำแหน่งเดิม', 'นับหมากมีชีวิตและอาณาเขต ไม่บวกหมากที่จับหรือฆ่าตัวเอง โคมิ 7.0 จึงเสมอได้', 'คะแนน = หมากบนกระดาน + อาณาเขตว่าง; ขาวบวกโคมิ 7.0', 'ดำ: 40 หมาก + 35 พื้นที่ = 75 ขาว: 37 + 31 + 7 = 75 เสมอ', 'การฆ่าตัวเองไม่ค่อยมีประโยชน์ ปกติควรรักษาลมหายใจ'],
  },
  tr: {
    headings: ['Maçın amacı', 'Her tur nasıl oynanır?', 'Maç ne zaman biter?', 'Puanlama', 'Puan örneği', 'Unutma'],
    terms: ['Puanlama', 'Komi', 'Tekrar', 'İntihar', 'Bölge', 'Alan', 'Basit Ko', 'Süperko', 'Yasak', 'Serbest'],
    goal: 'Amaç tüm rakip taşlarını yakalamak değildir. Boş kesişimleri çevrele, gruplarını yaşat ve rakibin bölgesini zayıflat.',
    ending: 'Önemli mücadele kalmadığında ölü grupları yakala ve Pas geç. Arka arkaya iki pas bitirir; “Puanla” mevcut tahtayı sayar.',
    japanese: ['Boş bölge ve yakalanan taşlarla kazan', 'Siyah başlar. Bağlı taşlar nefesleri paylaşır; nefessiz grup yakalanır. İntihar yasaktır. Basit Ko önceki konuma anında geri almayı engeller.', 'Her rengin tamamen çevrelediği boş kesişimleri say ve yakalanan rakip taşlarını ekle. İki renge değen alan nötrdür.', 'Puan = boş bölge + yakalanan taşlar; Beyaz 6,5 Komi alır.', 'Siyah: 38 bölge + 6 yakalama = 44. Beyaz: 34 + 3 + 6,5 = 43,5. Siyah 0,5 farkla kazanır.', 'Japon kuralları yakalamayı doğrudan ödüllendirir. Puanlamadan önce ölü grupları kaldır.'],
    chinese: ['Canlı taşlar ve bölgeyle kazan', 'Yerleştirme, bağlama ve yakalama Japon kuralları gibidir; intihar yasaktır. Süperko önceki tüm tahta konumlarını yasaklar.', 'Canlı taşları ve çevrili boş kesişimleri say. Yakalamalar ayrıca eklenmez.', 'Puan = tahtadaki taşlar + boş bölge; Beyaz 7,5 Komi alır.', 'Siyah: 42 taş + 33 bölge = 75. Beyaz: 38 + 29 + 7,5 = 74,5. Siyah 0,5 farkla kazanır.', 'Çin alan puanı kolay denetlenir: canlı taşlar ve bölge sayılır.'],
    'new-zealand': ['İntihara izin veren alan puanı', 'Çin kuralları gibi oynanır, ancak kendi grubunu nefessiz bırakıp kaldırabilirsin. Süperko eski konumları yine engeller.', 'Canlı taşları ve bölgeyi say. Yakalanan veya intihar eden taşlar ayrıca eklenmez. 7,0 Komi beraberliğe izin verir.', 'Puan = tahtadaki taşlar + boş bölge; Beyaz 7,0 Komi alır.', 'Siyah: 40 taş + 35 bölge = 75. Beyaz: 37 + 31 + 7 = 75. Berabere.', 'İntihar nadiren yararlıdır. Genellikle nefeslerini koru.'],
  },
};

const FALLBACK = GUIDE.en;

function listMarkup(items) {
  return `<ol>${items.map((item) => `<li>${item}</li>`).join('')}</ol>`;
}

export function renderRuleGuide(container, ruleKey, locale = 'vi') {
  const language = GUIDE[locale] ?? FALLBACK;
  const rule = language[ruleKey] ?? language.japanese;
  const isJapanese = ruleKey === 'japanese';
  const isNewZealand = ruleKey === 'new-zealand';
  const facts = [
    [language.terms[0], language.terms[isJapanese ? 4 : 5]],
    [language.terms[1], isJapanese ? '6.5' : isNewZealand ? '7.0' : '7.5'],
    [language.terms[2], language.terms[isJapanese ? 6 : 7]],
    [language.terms[3], language.terms[isNewZealand ? 9 : 8]],
  ];
  const playSteps = [
    t(locale, 'rules.placeCopy'),
    t(locale, 'rules.libertyCopy'),
    rule[1],
  ];

  container.innerHTML = `
    <article class="rule-guide-panel">
      <header class="rule-guide-header"><div><p>${rule[0]}</p><h3>${t(locale, `rule.${ruleKey}`)}</h3></div></header>
      <div class="rule-facts">${facts.map(([label, value]) => `<span><small>${label}</small><strong>${value}</strong></span>`).join('')}</div>
      <section class="guide-block"><span class="guide-number">01</span><div><h4>${language.headings[0]}</h4><p>${language.goal}</p></div></section>
      <section class="guide-block"><span class="guide-number">02</span><div><h4>${language.headings[1]}</h4>${listMarkup(playSteps)}</div></section>
      <section class="guide-block"><span class="guide-number">03</span><div><h4>${language.headings[2]}</h4><p>${language.ending}</p></div></section>
      <section class="guide-block"><span class="guide-number">04</span><div><h4>${language.headings[3]}</h4><p>${rule[2]}</p><div class="score-formula">${rule[3]}</div></div></section>
      <section class="score-example"><strong>${language.headings[4]}</strong><p>${rule[4]}</p></section>
      <section class="guide-reminder"><strong>${language.headings[5]}</strong><p>${rule[5]}</p></section>
    </article>
  `;
}
