var app = app || {};
    app.utils = {
        loadTemplate: function(views, callback) {

            var deferreds = [];

            $.each(views, function(index, view) {
                if (app[view]) {
                    deferreds.push($.get('tpl/' + view + '.html', function(data) {
                        app[view].prototype.template = _.template(data);
                    }));
                } else {
                    alert(view + " not found");
                }
            });

            $.when.apply(null, deferreds).done(callback);
        },
        uploadFile: function (file, callbackSuccess) {
            var self = this;
            var data = new FormData();
            data.append('file', file);
            $.ajax({
                url: 'api/upload.php',
                type: 'POST',
                data: data,
                processData: false,
                cache: false,
                contentType: false
            })
            .done(function () {
                console.log(file.name + " uploaded successfully");
                callbackSuccess();
            })
            .fail(function () {
                self.showAlert('Error!', 'An error occurred while uploading ' + file.name, 'alert-error');
            });
        },
        cleanUpSpecialChars: function(str) {
            str = str.replace(/[ÀÁÂÃÄÅ]/g, "A")
                     .replace(/[àáâãäå]/g, "a")
                     .replace(/[ÈÉÊË]/g, "E")
                     .replace(/[èéêë]/g, "e")
                     .replace(/[ÌÍĨÎÏ]/g, "I")
                     .replace(/[ìíĩîï]/g, "i")
                     .replace(/[ÒÓÔÕÖ]/g, "O")
                     .replace(/[òóôõö]/g, "o")
                     .replace(/[ÙÚÛŨÜ]/g, "U")
                     .replace(/[ùúûũü]/g, "u")
                     .replace(/[ÝŸ]/g, "Y")
                     .replace(/[ýÿ]/g, "y");

            return str.replace("%20", "_"); // final clean up
        }
    }