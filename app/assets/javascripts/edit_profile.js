$( document ).ready(function() {
    // when user clicks "show all" dropdown with limited number of orgs should be hidden
    // and one with all orgs should be shown
    $("#see-all-orgs-link").click(function(e){
        e.preventDefault();

        // reset first dropdown select
        $("#s2id_user_organisation_id").select2("val", "");

        // hide first dropdown
        $("#s2id_user_organisation_id").hide();

        // show second dropdown
        $("#s2id_full_dropdown").show();
    });

    // on submit remove dropdown with no value, otherwise both dropdown will be submitted (with same names)
    $("form").submit(function(event){
        event.preventDefault();

        // if value is empty remove it
        if(!$("#s2id_full_dropdown").select2("val")){
            $("#full_dropdown").remove();
        } else {
            // only one of the forms can have value, it the full one isn't empty then this one is
            $("#user_organisation_id").remove();
        }

        this.submit();
    });
});
