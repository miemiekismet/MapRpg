d3.json("hero.json", function(hero) {
  initialize(hero);

  function initialize(hero) {
    var hero_status = d3.select("#hero_base");
    hero_status.html(hero["NAME"] + "    HP: " + hero["HP"] + "/" + hero["HP"]);
    hero_status.node.hero = hero;
    var level = d3.select("#hero_level");
    level.html("   Level: " + hero_status.node.hero["LEVEL"]);

    // Auto recovery.
    setInterval(function(){
      var hero_status = d3.select("#hero_base");
      if (hero_status.node.hero["HP"] < hero_status.node.hero["MAX_HP"]) {
        hero_status.node.hero["HP"] += Math.ceil(hero_status.node.hero["MAX_HP"] / 20);
        UpdateHp(hero_status.node.hero["HP"]);
      }
    }, 5000);
  }
});

d3.json("level.json", function(level) {
  initialize(level);
  function initialize(level) {
    var static_data = d3.select("#static_data");
    static_data.node.static_data = level;
  }
});

function UpdateHp(hero_hp) {
  var hero_status = d3.select("#hero_base");
  d3.select("#hero_base").node.hero["HP"] = hero_hp;
  hero_status.html(hero_status.node.hero["NAME"] + "    HP: " + hero_status.node.hero["HP"] + "/" + hero_status.node.hero["MAX_HP"]);
}

function UpdateHero(exp) {
    var hero_status = d3.select("#hero_base");
    hero_status.node.hero["EXP"] += exp;
    var new_exp = hero_status.node.hero["EXP"];

    var static_data = d3.select("#static_data");
    if (new_exp >= static_data.node.static_data[hero_status.node.hero["LEVEL"]+1]["EXP"]) {
      hero_status.node.hero["LEVEL"] += 1;
      hero_status.node.hero["ATK"] = static_data.node.static_data[hero_status.node.hero["LEVEL"]]["ATK"];
      hero_status.node.hero["HP"] = static_data.node.static_data[hero_status.node.hero["LEVEL"]]["HP"];
      hero_status.node.hero["MAX_HP"] = static_data.node.static_data[hero_status.node.hero["LEVEL"]]["HP"];
      UpdateHp(hero_status.node.hero["HP"]);

      var level = d3.select("#hero_level");
      level.html("Level: " + hero_status.node.hero["LEVEL"]);
      alert("LEVEL UP");
    }
}

function Fight(monster, callback) {
  ShowFighting();
  var hero_hp = d3.select("#hero_base").node.hero["HP"];
  var hero_atk = d3.select("#hero_base").node.hero["ATK"];
  var monster_hp = monster.value;
  var monster_atk = monster.atk;
  var win = false;

  // Start fighting.
  var fight_timer = setInterval(function(){
    monster_hp -= hero_atk;
    if (monster_hp <= 0) {
      UpdateHp(hero_hp);
      win = true;
      clearInterval(fight_timer);
      UpdateHero(monster.value);
      monster.beaten = true;
      // Repaint this map, to get correct color of each monster.
      // TODO: Write a better repaint function, instead of reuse transition.
      callback(monster.parent);
      StopFighting();
      return;
    }
    hero_hp -= monster_atk;
    if (hero_hp <= 0) {
      UpdateHp(0);
      clearInterval(fight_timer);
      // Show death message.
      d3.select("#death_alert")
        .style('opacity', 1)
        .transition()
        .duration(2000)
        .style('opacity', 0);
      StopFighting();
      return;
    }
    UpdateHp(hero_hp);
  }, 1000);
}

function ShowFighting() {
  d3.select("#map_disable_layer")
    .classed("fighting", true)
    .html("FIGHTING");
}
function StopFighting() {
  d3.select("#map_disable_layer")
    .classed("fighting", false)
    .html("");
}