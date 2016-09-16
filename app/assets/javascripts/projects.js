$( document ).ready(function() {

/*	
	$("#project_funder_id").select2({
		placeholder: "Select a funder"
	});
*/
    function projectFunderChanged(dataSelector){
        update_template_options();
        update_guidance_options();
        if ($(this).val().length > 0) {
            $("#other-funder-name").hide();
            $("#project_funder_name").val("");
        }
        else {
            $("#other-funder-name").show();
        }
        $("#institution-control-group").show();
        $("#create-plan-button").show();
        $("#confirm-funder").text($(dataSelector).select2('data').text);
    }

	$("#project_funder_id").change(function () {
        projectFunderChanged.bind(this)("#project_funder_id");
	});

    $("#full_dropdown_funders").change(function () {
        projectFunderChanged.bind(this)("#full_dropdown_funders");
    });

	$("#no-funder").click(function(e) {
		e.preventDefault();
		$("#project_funder_id").select2("val", "");
		update_template_options();
		update_guidance_options();
		$("#institution-control-group").show();
		$("#create-plan-button").show();
		$("#other-funder-name").show();
		$("#confirm-funder").text(I18n.t("helpers.none"));
	});

	$("#project_funder_name").change(function(){
		$("#confirm-funder").text($(this).val());
	});

    function projectInstitutionChanged(dataSelector){
        update_template_options();
        update_guidance_options();
        $("#confirm-institution").text($(dataSelector).select2('data').text);
    }

	$("#project_institution_id").change(function () {
        projectInstitutionChanged("#project_institution_id");
	});

    $("#full_dropdown_institution").change(function () {
        projectInstitutionChanged("#full_dropdown_institution");
    });

	$("#no-institution").click(function() {
		$("#project_institution_id").select2("val", "");
		update_template_options();
		update_guidance_options();
		$("#confirm-institution").text(I18n.t("helpers.none"));
	});

	$("#project_dmptemplate_id").change(function (f) {
		update_guidance_options();
		$("#confirm-template").text($("#project_dmptemplate_id :selected").text());
	});

	$("#project-confirmation-dialog").on("show", function(){
		if ($("#confirm-institution").text() == "") {
			$("#confirm-institution").text(I18n.t("helpers.none"));
		}
		if ($("#confirm-funder").text() == "") {
			$("#confirm-funder").text(I18n.t("helpers.none"));
		}
		if ($("#confirm-template").text() == "") {
			$("#confirm-template").closest("div").hide();
		}
		else {
			$("#confirm-template").closest("div").show();
		}
		$("#confirm-guidance").empty();
		$("input:checked").each(function(){
			$("#confirm-guidance").append("<li id='confirm-"+$(this).attr("id")+"'>"+$(this).parent().text()+"</li>");
		});
		$('.select2-choice').hide();
	});

	$("#new-project-cancelled").click(function (){
		$("#project-confirmation-dialog").modal("hide");
		$('.select2-choice').show();
	});

	$("#new-project-confirmed").click(function (){
        removeExtraParams();
		$("#new_project").submit();
	});

    //for the default template alert
	$("#default-template-confirmation-dialog").on("show", function(){
		$('.select2-choice').hide();
	});

	$("#default-template-cancelled").click(function (){
		$("#default-template-confirmation-dialog").modal("hide");
		$('.select2-choice').show();
	});

	$("#default-template-confirmed").click(function (){
		$("#default_tag").val('true');
        removeExtraParams();
        $("#new_project").submit();
	});


	function update_template_options() {
		var options = {};
		var funder = getCurrentFunderVal();
		var institution = getCurrentInstitutionVal();
		$.ajax({
			type: 'GET',
			url: "possible_templates.json?institution="+institution+"&funder="+funder,
			dataType: 'json',
			async: false, //Needs to be synchronous, otherwise end up mixing up answers
			success: function(data) {
				options = data;
			}
		});
		select_element = $("#project_dmptemplate_id");
		select_element.find("option").remove();
		var count = 0;
		for (var id in options) {
			if (count == 0) {
				select_element.append("<option value='"+id+"' selected='selected'>"+options[id]+"</option>");
			}
			else {
				select_element.append("<option value='"+id+"'>"+options[id]+"</option>");
			}
			count++;
		}
		if (count >= 2) {
			$("#template-control-group").show();
		}
		else {
			$("#template-control-group").hide();
		}
		$("#confirm-template").text("");
		$("#project_dmptemplate_id").change();
	}

	function update_guidance_options() {
		var institution = getCurrentInstitutionVal();
		var template = $("#project_dmptemplate_id :selected").val();
		var options = null;
		
		$.ajax({
			type: 'GET',
			url: "possible_guidance.json?institution="+institution+"&template="+template,
			dataType: 'json',
			async: false, //Needs to be synchronous, otherwise end up mixing up answers
			success: function(data) {
				options = data;
			},
			error: function(err){
				console.log(err);
			}
		});
		options_container = $("#guidance-control-group");
		options_container = options_container.find(".choices-group");
		options_container.empty();
				
		var count = 0;
		for (var id in options) {
			options_container.append("<li class='choice'><label for='project_guidance_group_ids_"+id+"'><input id='project_guidance_group_ids_"+id+"' name='project[guidance_group_ids][]' type='checkbox' value='"+id+"' />"+options[id]+"</label></li>");
			count++;
		}
		if (count > 0) {
			$("#guidance-control-group").show();
		}
		else {
			$("#guidance-control-group").hide();
		}
	}

    $("#see-all-funders-link").click(function(e){
        e.preventDefault();

        // add float to the <li> so that dropdown is displayed on the same line the label is
        $($($('#funder-control-group').children()[0]).children()[0]).css('float','left');

        // hide see all text
        $("#see-all-funders-link").hide();

        // reset the original dropdown select
        $("#s2id_project_funder_id").select2("val", "");

        // hide the original dropdown
        $("#s2id_project_funder_id").hide();

        // show the new dropdown
        $("#s2id_full_dropdown_funders").show();
    });

    $("#see-all-institutions-link").click(function(e){
        e.preventDefault();

        // add float to the <li> so that dropdown is displayed on the same line the label is
        $($($('#institution-control-group').children()[0]).children()[0]).css('float','left');

        // hide see all text
        $("#see-all-institutions-link").hide();

        // reset the original dropdown select
        $("#s2id_project_institution_id").select2("val", "");

        // hide the original dropdown
        $("#s2id_project_institution_id").hide();

        // show the new dropdown
        $("#s2id_full_dropdown_institution").show();
    });

    function removeExtraParams(){
        // remove inactive funder dropdown
        if($("#s2id_project_funder_id").select2("val")){
            $("#full_dropdown_funders").remove();
        } else {
            $("#project_funder_id").remove();
        }

        // remove inactive institution dropdown
        if($("#s2id_project_institution_id").select2("val")){
            $("#full_dropdown_institution").remove();
        } else {
            $("#project_institution_id").remove();
        }
    }

    /**
     * Right Funder dropdown has to be picked
     * @returns {jQuery}
     */
    function getCurrentFunderVal(){
        if($("#s2id_project_funder_id").select2("val")){
            return $("#project_funder_id").select2('val');
        } else {
            return $("#full_dropdown_funders").select2('val');
        }
    }

    /**
     * Right Institution dropdown has to be picked
     * @returns {jQuery}
     */
    function getCurrentInstitutionVal(){
        if($("#s2id_project_institution_id").select2("val")){
            return $("#project_institution_id").select2('val');
        } else {
            return $("#full_dropdown_institution").select2('val');
        }
    }
});
