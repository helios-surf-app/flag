$(window).bind("load", function() {



    // remove unnessary parameters from url



    window.history.replaceState({}, document.title, "/" + "");







    const ssc = new SSC("https://engine.rishipanthee.com/");



    var user = null, bal = { HELIOS: 0, VALUE: 0 }, marketvalues;



    const min = {



        HELIOS: 5



    };







    function dec(val) {



        return Math.floor(val * 1000) / 1000;



    }







    // async function getBridge () {



    //     const res = await hive.api.getAccountsAsync(['hiveupme']);



    //     const res2 = await ssc.findOne("tokens", "balances", { account: 'hiveupme', symbol: 'SWAP.HIVE' });



    //     $("#hive_liq").text(parseInt(res[0].balance.split(" ")[0]));



    //     $("#swap_liq").text(parseInt(res2.balance));



    //     $("#bridge").removeClass("d-none");



    // }



    



    // getBridge();







    async function getBalances (account) {



        const res = await hive.api.getAccountsAsync([account]);



        if (res.length > 0) {



            const res2 = await ssc.find("tokens", "balances", { account, symbol: "HELIOS" }, 1000, 0, []);



            var helios = res2.find(el => el.symbol === "HELIOS");



            if (res2.length > 0) {



                var val = (parseFloat(helios.balance) * parseFloat(marketvalues.HELIOS.lastPrice)) * parseFloat(marketvalues.HIVE);



                return {



                    HELIOS: dec(parseFloat((helios) ? helios.balance : 0)),



                    VALUE: parseFloat(val).toFixed(8)



                }



            } else return { HELIOS: 0, VALUE: 0 };



        } else return { HELIOS: 0, VALUE: 0 };



    }







    async function getMarket (symbols) {



        const res = await ssc.find("market", "metrics", { symbol: { "$in": [...symbols] } }, 1000, 0, []);



        const { data } = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=hive&vs_currencies=usd");



        var HELIOS = res.find(el => el.symbol === "HELIOS");



        return {



            HIVE: data.hive.usd,



            HELIOS,



        }



    }







    async function refresh () {



        marketvalues = await getMarket(["HELIOS"]);



        $("#helios_price").text(marketvalues.HELIOS.lastPrice);



        $("#helios_value").text((marketvalues.HELIOS.lastPrice * marketvalues.HIVE).toFixed(8));



        $("#helios_vol").text((marketvalues.HELIOS.volume * marketvalues.HIVE).toFixed(8));



        $("#helios_change").text(marketvalues.HELIOS.priceChangePercent);



    };







    $("#refresh").click(async function () {



        $(this).attr("disabled", true);



        await refresh();



        $(this).removeAttr("disabled");



    });







    async function updateBurn(r) {



        try {



            const symbol = $("#input").val();



            const val = $("#inputquantity").val();



            const post_link = $("#post").val();







            const {



                lastPrice,



                lastDayPrice



            } = marketvalues[symbol];



            let es_val = (parseFloat(lastPrice) + parseFloat(lastDayPrice)) / 2;



            es_val *= marketvalues.HIVE;



            es_val *= val;



            es_val = dec(es_val);



            $("#es_val").text(`$ ${es_val}`);







            function isMin(val) {



                if (val >= min[symbol]) return true;



                else return false;



            }







            if (isMin(val)



                && bal[symbol] >= val



                && post_link.length > 0



                ) {



                $("#swap").removeAttr("disabled");



                if (r) r(true, parseFloat(val).toFixed(3), symbol, post_link);



            } else {



                $("#swap").attr("disabled", "true");



                if (r) r(false, 0, 0, comment);



            }



        } catch (e) {



            console.log(e);



        }



    }







    $(".s").click(function () {



        $("#input").val($(this).find(".sym").text());



        $("#inputquantity").val($(this).find(".qt").text());



        updateBurn();



    });







    $("#inputquantity").keyup(() => { updateBurn(); });



    $("#input").change(() => { updateBurn(); });



    $("#post").keyup(() => { updateBurn(); });







    async function updateBalance() {



        marketvalues = await getMarket(["HELIOS"]);



        bal = await getBalances(user);







        $("#helios").text(bal.HELIOS.toFixed(3));



        $("#helios_bal_value").text(bal.VALUE);



    }







    $("#checkbalance").click(async function() {



        user = $.trim($("#username").val().toLowerCase());



        if (user.length >= 3) {



            $(this).attr("disabled", "true");



            await updateBalance();



            updateBurn();



            $(this).removeAttr("disabled");



            localStorage['user'] = user;



        }



    });







    if (localStorage['user']) {



        $("#username").val(localStorage['user']);



        user = localStorage['user'];



        updateBalance();



    }







    function isValid (post) {



        // 6 days in milliseconds

        const valid_diffence = 6 * 24 * 60 * 60 * 1000;



        const { created } = post;



        const created_timestamp = new Date(created).getTime();



        const current_timestamp = new Date().getTime();



        const diff = current_timestamp - created_timestamp;







        if (diff > valid_diffence) return false;



        else return true;



    }





    // bootstrap modal for confirmation

    let modal = `

    <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">

    <div class="modal-dialog modal-dialog-centered">

        <div class="modal-content bg-dark">

        <div class="modal-header text-warning border-0 justify-content-center">

            <h1 class="modal-title fs-5 text-center" id="staticBackdropLabel">WARNING</h1>

        </div>

        <div class="modal-body text-warning text-center">

            Please confirm, you are about to submit a Flag or Downvote!

        </div>

        <div class="modal-footer border-0 justify-content-center">

            <button style="width:80px;" type="button" class="btn btn-secondary rounded-pill" data-bs-dismiss="modal">No</button>

            <button style="width:80px;" id="confirmburn" type="button" class="btn btn-danger rounded-pill">

            <span style="vertical-align: middle; color: #ffffff;">Yes</span>

            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" style="vertical-align: middle; color: #ffffff;" fill="currentColor" class="bi bi-fire" viewBox="0 0 16 16">

                <path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16Zm0-1c-1.657 0-3-1-3-2.75 0-.75.25-2 1.25-3C6.125 10 7 10.5 7 10.5c-.375-1.25.5-3.25 2-3.5-.179 1-.25 2 1 3 .625.5 1 1.364 1 2.25C11 14 9.657 15 8 15Z"/>

            </svg>

            </button>

        </div>

        </div>

    </div>

    </div>

    `;

    $("body").append(modal);



    $("#swap").click(async function() {

        // show modal

        $("#staticBackdrop").modal("show");

    });

    

    // modal button click

    $("#confirmburn").click(async function() {

        // hide modal

        $("#staticBackdrop").modal("hide");

        // do the swap

        await swapFinal();

    });



    async function swapFinal() {



        $("#swap").attr("disabled", "true");



        $("#loading").removeClass("d-none");



        $("#status").text("Please Wait...");



        await refresh();



        await updateBalance();



        updateBurn(async function(canBurn, amount, currency, post_link) {



            if (canBurn) {



                $("#swap").attr("disabled", "true");







                let post = false;



                try {



                    const author = post_link.split("@")[1].split("/")[0];



                    const link = post_link.split("@")[1].split("/")[1];



                    post = await hive.api.getContentAsync(author, link);



                    if (!post.created) throw error;



                } catch (e) {



                    $("#status").text("Invalid Post Link");



                    $("#swap").removeAttr("disabled");



                    $("#loading").addClass("d-none");



                    return;



                }



    



                if (!post) {



                    $("#status").text("Invalid Post Link");



                    $("#swap").removeAttr("disabled");



                    $("#loading").addClass("d-none");



                    return;



                }







                if (!isValid(post)) {



                    $("#status").text("Post is older than 6 days");



                    $("#loading").addClass("d-none");



                    $("#swap").removeAttr("disabled");



                    return;



                };







                $("#loading").addClass("d-none");



                $("#status").text(`Confirm the transaction through Keychain.`);







                try {



                    hive_keychain.requestHandshake();



                } catch (e) {



                    $("#loading").addClass("d-none");



                    $("#status").text("No method of transaction available, Install Keychain.");



                    updateBurn();



                }



                



                if (currency === "HELIOS") {



                    hive_keychain.requestSendToken(



                        user,



                        "helios.dburn",



                        amount,



                        post_link,



                        currency,



                        async function (res) {



                            if (res.success === true) {



                                $("#status").text("Successfully Sent To Burn!");



                                $("#status").addClass("text-success");



                                await updateBalance();



                                updateBurn();



                            } else {



                                $("#status").text("Transaction failed, Please try again.");



                                updateBurn();



                            }



                            console.log(res);



                        }



                    );



                }



            } else {



                $("#loading").addClass("d-none");



                $("#status").text('Account balance updated, Try Again.');



                updateBurn();



            }



        });



    };







    refresh();



    // setInterval(() => { refresh(); updateBalance(); }, 5000);



});