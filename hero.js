d3.json("hero.json", function(hero) {
  initialize(hero);

  function initialize(hero) {
    var hero_status = d3.select("#hero_base");
    var hp_text = hero_status.select(".hp_text");
    hero_status.node.hero = hero;
    UpdateHp(hero["HP"]);
    var level = d3.select("#hero_level");
    level.html("Level: " + hero_status.node.hero["LEVEL"]);

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
  // Update node.
  var hero_status = d3.select("#hero_base");
  var hero = hero_status.node.hero;
  hero["HP"] = hero_hp;
  // Update hp text.
  var hp_text = hero_status.select(".hp_text");
  hp_text.html("HP: " + hero["HP"] + "/" + hero["MAX_HP"] + "   ");
  // Repaint hp bar.
  var total_length = 100;
  var left_bar = hero_status.select(".left_bar");
  var right_bar = hero_status.select(".right_bar");
  left_bar.style('width', Math.floor(hero["HP"] / hero["MAX_HP"] * total_length) + 'px');
  right_bar.style('width', (total_length - Math.floor(hero["HP"] / hero["MAX_HP"] * total_length)) + 'px');
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
  var monster_name = monster.name;
  var monster_hp = monster.value;
  var monster_max_hp = monster.value;
  var monster_atk = monster.atk;
  var win = false;

  UpdateMonster(monster_name, monster_max_hp, monster_max_hp);

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
      UpdateMonster(monster_name, monster_max_hp, monster_max_hp);
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
      UpdateMonster(monster_name, monster_max_hp, monster_max_hp);
      StopFighting();
      return;
    }
    UpdateHp(hero_hp);
    UpdateMonster(monster_name, monster_hp, monster_max_hp);
  }, 1000);
  function UpdateMonster(name, hp, max_hp) {
    var layer = d3.select("#map_disable_layer");
    var left_bar = layer.select(".left_bar");
    var right_bar = layer.select(".right_bar");
    var monster_hp = layer.select(".hp_text");
    monster_hp.html(name + " HP: " + hp);
    var total_length = 200;
    left_bar.style('width', Math.floor(hp / max_hp * total_length) + 'px');
    right_bar.style('width', (total_length - Math.floor(hp / max_hp * total_length)) + 'px');
  }
}

function ShowFighting() {
  d3.select("#map_disable_layer")
    .classed("fighting", true);
}

function StopFighting() {
  d3.select("#map_disable_layer")
    .classed("fighting", false);
}