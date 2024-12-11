var fiddlePoints = 0;
var loopFn = null;

var upgrades = {
    'html-html': [
        {cost:  0, html: '&lt;div&gt;'},
        {cost: 10, html: '&lt;div class="well"&gt;', eval: '$("#html-area").addClass("well")'}
    ],

    'button-html': [
        {cost:  0, html: '&lt;button id="fiddle"&gt;Fiddle&lt;/button&gt;'},
        {cost: 10, html: '&lt;button id="fiddle" class="btn btn-primary"&gt;Fiddle&lt;/button&gt;', eval: '$("#fiddle").addClass("btn btn-primary")'}
    ],
    
    'fiddle-increment-html': [
        {cost:  0, html: 'fiddlePoints++;'},
        {cost: 20, html: 'fiddlePoints += 2;', eval: 'clickConstant = 2'},
        {cost: 30, html: 'fiddlePoints += 3;', eval: 'clickConstant = 3'},
        {cost: 50, html: 'fiddlePoints += 5;', eval: 'clickConstant = 5'}
    ],
    
    'interval-html': [
        {cost: 0, html: '// TODO: add setInterval call'},
        {cost: 100, html: 'window.setInterval(function() {<br/><div class="indent">fiddlePoints++;</div>}, 1000);', eval: 'intervalConstant = 1'},
        {cost: 200, html: 'window.setInterval(function() {<br/><div class="indent">fiddlePoints += 3;</div>}, 1000);', eval: 'intervalConstant = 3'},
        {cost: 300, html: 'window.setInterval(function() {<br/><div class="indent">fiddlePoints += 5;</div>}, 1000);', eval: 'intervalConstant = 5'},
        {cost: 500, html: 'window.setInterval(function() {<br/><div class="indent">fiddlePoints += 5;</div>}, 500);', eval: 'updateInterval(500)'},
        {cost: 1000, html: 'window.setInterval(function() {<br/><div class="indent">fiddlePoints += 5;</div>}, 100);', eval: 'updateInterval(100); winGame()'}
    ]
};

$.each(upgrades, function(id) {
    var levels = upgrades[id];
    $.each(levels, function(levelNum) {
        var levelData = levels[levelNum];
        levelData.levelNum = levelNum;
        if (levels.length > levelNum + 1) {
            levelData.next = levels[levelNum + 1];
        }
    });
    $('#'+id).data(levels[0]);
});

var clickConstant = 1;
$('#fiddle').on('click', function () {
    fiddlePoints += clickConstant;
    $('#fiddle-points').text(fiddlePoints);
});

$('.swappable').on('mouseenter', function(el) {
    var $target = $(el.target);
    var data    = $target.data();

    if (data.next) {
        if (fiddlePoints >= data.next.cost) {
            $target.html(data.next.html);
            $target.addClass('pending-purchase');
        }
    }
});

$('.swappable').on('mouseleave', function(el) {
    var $target = $(el.target);
    var data = $target.data();
   
    if (data.html) {
        $target.html(data.html);
    }
    
    $target.removeClass('pending-purchase');
});

$('body').on('click', '.swappable', function(el) {
    var $target = $(el.target);
    if (!$target.hasClass('.swappable')) {
        $target = $target.closest('.swappable');
    }
    var data = $target.data();
    
    if (!data.next || fiddlePoints < data.next.cost) {
        return;
    }
    
    fiddlePoints -= data.next.cost;

    var hasNext = !!data.next.next;
    var hasEval = !!data.next.eval;
    $target.data(data.next);
    
    if (!hasNext) {
        $target.removeData('next');
    }
    
    if (!hasEval) {
        $target.removeData('eval');
    }
    
    if (data.eval) {
        eval(data.eval);
    }
    
    updateStats();
    $target.removeClass('pending-purchase');
    $target.trigger('mouseenter');
});

var intervalConstant = 0;
setGameLoop(function() {
    fiddlePoints += intervalConstant;
    updateStats();
    checkWin();
}, 1000);

function setGameLoop(fn, interval) {
    loopFn = fn;
    if (window.gameLoop) {
        clearInterval(gameLoop);
    }
    
    window.gameLoop = window.setInterval(fn, interval);
}

function updateStats() {
    $('#fiddle-points').text(fiddlePoints);
}

function updateInterval(interval) {
    setGameLoop(loopFn, interval);
}

function checkWin() {
    if (window.winConfirmed) {
        return;
    }

    var allUpgrades = true;
    $.each(upgrades, function(id) {
        if (upgrades[id].length != $('#'+id).data('levelNum') + 1) {
            allUpgrades = false;
            return false;
        }
    });
    
    if (allUpgrades) {
        alert("That's it for now, thanks for playing!");
        window.winConfirmed = true;
    }
}
